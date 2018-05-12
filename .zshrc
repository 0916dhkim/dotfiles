# Colored ls
alias ls='ls -l --color=auto'

# Autocompletion
autoload -Uz compinit promptinit
compinit
promptinit

# gpg
export GPG_TTY=$(tty)

zstyle ':completion:*' menu select

prompt clint
