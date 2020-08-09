(require 'ensure-package)
(ensure-package 'clang-format)
(require 'clang-format)

;; Disable default style.
(setq c-syntactic-indentation nil)

;; Replace default indent function with clang-format-region.
(fset 'c-indent-region #'clang-format-region)

;; Run clang-format before save.
(add-hook 'c++-mode-hook
          (lambda ()
            (add-hook 'before-save-hook #'clang-format-buffer))
          nil t)

(provide 'donghyeon-clang-format)
