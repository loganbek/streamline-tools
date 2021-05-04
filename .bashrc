shopt -s expand_aliases

# LINT ALIASES
# alias alias_name="command_to_run"
alias lint-concise="npx standard | npx standard-summary | npx snazzy"
alias lint-verbose="npx standard --verbose | npx snazzy"
alias lint-fix="npx standard --fix"