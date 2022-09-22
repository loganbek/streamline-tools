# STUB | SHELL LINT
shopt -s expand_aliases

# Path: .zshrc

# STUB | SHELL LINT
# zsh shopt equivalent setopt
# setopt extended_glob
# setopt {

# }

# LINT ALIASES
# alias alias_name="command_to_run"
alias lint-concise="npx standard | npx standard-summary | npx snazzy"
alias lint-verbose="npx standard --verbose | npx snazzy"
alias lint-fix="npx standard --fix"