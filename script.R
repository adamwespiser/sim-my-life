library(tidyverse)
library(rvest)
library(lubridate)
library(scales)
library(stringr)

damodaran_url <- "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html"

tables <- read_html(damodaran_url) %>% html_table(fill = TRUE)

# Find the table that has the S&P 500 total returns column
find_sp_table <- function(tbls) {
  for (i in seq_along(tbls)) {
    nm <- names(tbls[[i]])
    if (any(str_detect(nm, regex("S&P 500", ignore_case = TRUE))) &&
        any(str_detect(nm, regex("^year$", ignore_case = TRUE)))) {
      return(tbls[[i]])
    }
  }
  stop("Could not locate the S&P 500 total return table on the page.")
}

sp_raw <- tables[[1]]

# Clean up: keep Year and S&P 500 (includes dividends)
year_col <- sp_raw$X1[3:(length(sp_raw$X1)-1)] %>% as.numeric()
ret_col  <- as.numeric(gsub("[^0-9.-]", "", sp_raw$X2[3:(length(sp_raw$X2)-1)])) / 100

sp_returns <- data.frame(
  Year = year_col,
  SP500_TR = ret_col
)

# Inspect the available range
range(sp_returns$Year)

# ---- 2) Simulation helper ----
# We’ll simulate year-by-year, using bootstrap sampling *with replacement* from the historical annual total returns.
# Within each simulated year, we compound monthly and add monthly contributions.

simulate_paths <- function(
  initial = 1000,          # initial lump sum at t = 0
  monthly_contrib = 1000,   # contribution at the end of each month
  years = 20,               # horizon in years
  n_sims = 10000,             # number of simulation paths
  returns_df = sp_returns,  # historical annual total returns (decimal)
  seed = 42                 # RNG seed for reproducibility
) {
  stopifnot("SP500_TR" %in% names(returns_df))
  set.seed(seed)
  hist_r <- returns_df$SP500_TR
  months_per_year <- 12
  # For speed, store results in a list then bind_rows
  sims <- vector("list", n_sims)
  for (s in seq_len(n_sims)) {
    # sample annual returns with replacement
    sampled_r <- sample(hist_r, size = years, replace = TRUE)
    bal <- initial
    yearly_bal <- numeric(years)
    for (y in seq_len(years)) {
      r <- sampled_r[y]
      # Monthly growth factor derived from annual total return r
      g_m <- (1 + r)^(1 / months_per_year)
      for (m in 1:months_per_year) {
        bal <- bal * g_m + monthly_contrib
      }
      yearly_bal[y] <- bal
    }
    sims[[s]] <- tibble(sim = s, year = 1:years, balance = yearly_bal)
  }
  bind_rows(sims)
}

#############################################################
#
# Modify these numbers
#
#############################################################
initial_sum      <- 0
monthly_contrib  <- 1000
years_horizon    <- 20
n_simulations    <- 10000

sim_results <- simulate_paths(
  initial = initial_sum,
  monthly_contrib = monthly_contrib,
  years = years_horizon,
  n_sims = n_simulations,
  returns_df = sp_returns,
  seed = 123
)
y0 <- sim_results %>%
  distinct(sim) %>%
  transmute(sim, year = 0L, balance = initial_sum)

sim_results <- bind_rows(y0, sim_results) %>%
  arrange(sim, year)

# ---- 4) Summary bands (optional) ----
summary_bands <- sim_results %>%
  group_by(year) %>%
  summarize(
    p10 = quantile(balance, 0.10),
    p50 = quantile(balance, 0.50),
    p90 = quantile(balance, 0.90),
    .groups = "drop"
  )

print(paste("final year result",summary_bands[nrow(summary_bands),]))

ggplot(sim_results, aes(x = year, y = balance, group = sim)) +
  geom_line(alpha = 0.03) +
  geom_ribbon(
    data = summary_bands,
    aes(x = year, ymin = p10, ymax = p90),
    inherit.aes = FALSE,
    alpha = 0.25,
		fill = "#6baed6",   # interior color
    color = NA         # no border (or set a color, e.g. "grey40")
  ) +
  geom_line(
    data = summary_bands,
    aes(x = year, y = p50),
    inherit.aes = FALSE,
    linewidth = 1.2
  ) +
  scale_y_continuous(labels = scales::label_dollar(accuracy = 1)) +
  labs(
    title = "Bootstrapped S&P 500 Total-Return Simulation",
    subtitle = paste0(
      n_simulations, " paths | ",
      years_horizon, " years | initial = ", scales::dollar(initial_sum),
      " | monthly = ", scales::dollar(monthly_contrib)
    ),
    x = "Year",
    y = "Portfolio Value (USD)",
    caption = "Annual returns source: Aswath Damodaran (S&P 500 incl. dividends). Monthly, end-of-month contributions."
  ) +
  theme_minimal(base_size = 12)
