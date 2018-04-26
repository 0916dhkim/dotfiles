" Show line number
set number

" Use file type plugins
syntax on
filetype plugin on
filetype indent on

" Set Highlight
set hlsearch
set cursorcolumn
set cursorline
colo zellner
hi CursorColumn term=bold cterm=bold ctermbg=darkblue

" clang_complete
let g:clang_library_path='/usr/lib/libclang.so'
