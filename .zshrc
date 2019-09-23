# ls formats
alias ls='ls --color=auto'

# Autocompletion
autoload -Uz compinit promptinit
compinit
promptinit

zstyle ':completion:*' menu select

# gpg
export GPG_TTY=$(tty)

# VCS info
autoload -Uz vcs_info
zstyle ':vcs_info:*' stagedstr '*'
zstyle ':vcs_info:*' unstagedstr '*'
zstyle ':vcs_info:*' check-for-changes true
zstyle ':vcs_info:*' formats '%b%c%u'
vcs_info_wrapper() {
    vcs_info

    if [[ ! -z $vcs_info_msg_0_ ]]; then
        PROMPT='%K{3}%F{10}'
	PROMPT+="%K{3}%F{0} $vcs_info_msg_0_ "
        PROMPT+='%K{10}%F{3}'
        echo $PROMPT
    fi
}

# Python virtual environment prompt
poetry_prompt() {
    if [[ -v POETRY_ACTIVE ]]; then
        PROMPT='%K{3}%F{0}Poetry '
        PROMPT+='%K{10}%F{3}'
        echo $PROMPT
    fi
}

# Custom Prompt
setopt PROMPT_SUBST
PROMPT=$'$(poetry_prompt)'
PROMPT+='%K{10}%F{0} %n '
PROMPT+=$'$(vcs_info_wrapper)'
PROMPT+='%K{10}%F{0}%(!.#.$)'
PROMPT+='%k%F{10}%f '

RPROMPT='%K{10}%F{0} '
RPROMPT+='%~%f'

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

# setup key accordingly
[[ -n "${key[Home]}"      ]] && bindkey -- "${key[Home]}"      beginning-of-line
[[ -n "${key[End]}"       ]] && bindkey -- "${key[End]}"       end-of-line
[[ -n "${key[Insert]}"    ]] && bindkey -- "${key[Insert]}"    overwrite-mode
[[ -n "${key[Backspace]}" ]] && bindkey -- "${key[Backspace]}" backward-delete-char
[[ -n "${key[Delete]}"    ]] && bindkey -- "${key[Delete]}"    delete-char
[[ -n "${key[Up]}"        ]] && bindkey -- "${key[Up]}"        up-line-or-history
[[ -n "${key[Down]}"      ]] && bindkey -- "${key[Down]}"      down-line-or-history
[[ -n "${key[Left]}"      ]] && bindkey -- "${key[Left]}"      backward-char
[[ -n "${key[Right]}"     ]] && bindkey -- "${key[Right]}"     forward-char
[[ -n "${key[PageUp]}"    ]] && bindkey -- "${key[PageUp]}"    beginning-of-buffer-or-history
[[ -n "${key[PageDown]}"  ]] && bindkey -- "${key[PageDown]}"  end-of-buffer-or-history
[[ -n "${key[ShiftTab]}"  ]] && bindkey -- "${key[ShiftTab]}"  reverse-menu-complete

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
