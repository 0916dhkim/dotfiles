;; Packages.
(require 'package)
(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/"))
(package-initialize)

;; Load my files.
(add-to-list 'load-path (expand-file-name "donghyeon" user-emacs-directory))
(require 'donghyeon)

;; Custom
(setq custom-file (expand-file-name "custom.el" user-emacs-directory))
(load custom-file)
