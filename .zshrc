# Colored ls
alias ls='ls -l --color=auto'

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
