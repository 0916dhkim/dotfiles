# ls formats
# Always show colored output
alias ls='ls -l --color=auto'
# Show broken links as blinking text.
LS_COLORS='mi=5'
export LS_COLORS

# Autocompletion
autoload -Uz compinit promptinit
compinit
promptinit

zstyle ':completion:*' menu select

# gpg
export GPG_TTY=$(tty)

# Custom Prompt
PROMPT='%F{yellow}%n%f@%F{green}%m%f>%(!.#.$) '
RPROMPT='%F{green}%~%f'
