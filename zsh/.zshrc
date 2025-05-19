### OH-MY-ZSH
# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="simple"

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
# plugins=(git nvm)

source $ZSH/oh-my-zsh.sh

### Personal Settings
# Local PATH
if [[ -d $HOME/.local/bin ]] ; then
	export PATH=$HOME/.local/bin:$PATH
fi

# Fix prompt width
export LC_CTYPE=en_US.UTF-8

# ls formats
alias ls='ls --color=auto'

# Autocompletion
autoload -Uz compinit promptinit
compinit
promptinit

zstyle ':completion:*' menu select

# gpg
export GPG_TTY=$(tty)

# Use vim or nvim for editor.
if command -v nvim > /dev/null; then
    export EDITOR=nvim
elif command -v vim > /dev/null; then
    export EDITOR=vim
fi

# Use pyenv.
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv > /dev/null; then
    eval "$(pyenv init --path)" # this only sets up the path stuff
    eval "$(pyenv init -)"      # this makes pyenv work in the shell
    pyenv_commands=( $(pyenv commands) )
    for pyenv_command in "${pyenv_commands[@]}"; do
        if [ "$pyenv_command" = "virtualenv-init" ]; then
            eval "$(pyenv virtualenv-init - zsh)"
        fi
    done
fi

# Use RVM.
if [[ -f $HOME/.rvm/scripts/rvm ]]; then
    source $HOME/.rvm/scripts/rvm
fi

# Key bindings
# create a zkbd compatible hash;
# to add other keys to this hash, see: man 5 terminfo
typeset -g -A key

key[Home]="${terminfo[khome]}"
key[End]="${terminfo[kend]}"
key[Insert]="${terminfo[kich1]}"
key[Backspace]="${terminfo[kbs]}"
key[Delete]="${terminfo[kdch1]}"
key[Up]="${terminfo[kcuu1]}"
key[Down]="${terminfo[kcud1]}"
key[Left]="${terminfo[kcub1]}"
key[Right]="${terminfo[kcuf1]}"
key[PageUp]="${terminfo[kpp]}"
key[PageDown]="${terminfo[knp]}"
key[ShiftTab]="${terminfo[kcbt]}"
case "$TERM" in
	xterm*)
		key[CtrlBackspace]="^H"
		key[CtrlDel]="^[[3;5~"
		;;
esac

# setup key accordingly
[[ -n "${key[Home]}"          ]] && bindkey -- "${key[Home]}"          beginning-of-line
[[ -n "${key[End]}"           ]] && bindkey -- "${key[End]}"           end-of-line
[[ -n "${key[Insert]}"        ]] && bindkey -- "${key[Insert]}"        overwrite-mode
[[ -n "${key[Backspace]}"     ]] && bindkey -- "${key[Backspace]}"     backward-delete-char
[[ -n "${key[Delete]}"        ]] && bindkey -- "${key[Delete]}"        delete-char
[[ -n "${key[Up]}"            ]] && bindkey -- "${key[Up]}"            up-line-or-history
[[ -n "${key[Down]}"          ]] && bindkey -- "${key[Down]}"          down-line-or-history
[[ -n "${key[Left]}"          ]] && bindkey -- "${key[Left]}"          backward-char
[[ -n "${key[Right]}"         ]] && bindkey -- "${key[Right]}"         forward-char
[[ -n "${key[PageUp]}"        ]] && bindkey -- "${key[PageUp]}"        beginning-of-buffer-or-history
[[ -n "${key[PageDown]}"      ]] && bindkey -- "${key[PageDown]}"      end-of-buffer-or-history
[[ -n "${key[ShiftTab]}"      ]] && bindkey -- "${key[ShiftTab]}"      reverse-menu-complete
[[ -n "${key[CtrlBackspace]}" ]] && bindkey -- "${key[CtrlBackspace]}" backward-kill-word
[[ -n "${key[CtrlDel]}"       ]] && bindkey -- "${key[CtrlDel]}"       kill-word

# Finally, make sure the terminal is in application mode, when zle is
# active. Only then are the values from $terminfo valid.
if (( ${+terminfo[smkx]} && ${+terminfo[rmkx]} )); then
	autoload -Uz add-zle-hook-widget
	function zle_application_mode_start {
		echoti smkx
	}
	function zle_application_mode_stop {
		echoti rmkx
	}
	add-zle-hook-widget -Uz zle-line-init zle_application_mode_start
	add-zle-hook-widget -Uz zle-line-finish zle_application_mode_stop
fi

# Add RVM to PATH for scripting. Make sure this is the last PATH variable change.
export PATH="$PATH:$HOME/.rvm/bin"


export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
