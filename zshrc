export PATH="$HOME/.local/bin:$PATH"
export PATH="/usr/local/mongodb/bin:$PATH"
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=1000
setopt SHARE_HISTORY
autoload -U +X compinit && compinit
autoload -U +X bashcompinit && bashcompinit
complete -o nospace -C /usr/local/bin/terraform terraform
export PATH="$HOME/.cargo/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
autoload -Uz compinit bashcompinit
compinit && bashcompinit
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
export PIPENV_PYTHON="$PYENV_ROOT/shims/python"


plugin=(
  pyenv
  python
  pip
)

eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)
eval "$(k3d completion zsh)"

export PATH="$PATH:/Users/casmirpatterson/.foundry/bin"

# pnpm
export PNPM_HOME="/Users/casmirpatterson/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
