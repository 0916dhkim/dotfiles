# If not running interactively, don't do anything
[[ $- != *i* ]] && return

# Colored ls
alias ls='ls --color=auto'

# Custom prompt
PS1="[\e[31m\u\e[39m@\e[93m\h\e[39m \e[32m\w\e[39m]\n\$ "
