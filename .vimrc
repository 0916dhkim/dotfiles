" Show line number
set number

" Pathogen
runtime bundle/vim-pathogen/autoload/pathogen.vim
execute pathogen#infect()

" Use file type plugins
syntax on
filetype plugin indent on

" Set Highlight
set hlsearch
set cursorcolumn
set cursorline
colo zellner
hi CursorColumn term=bold cterm=bold ctermbg=darkblue

" clang_complete
let g:clang_library_path='/usr/lib/libclang.so'
