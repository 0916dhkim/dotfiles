(defvar-local cmakeproject-source-directory nil)
(put 'cmakeproject-source-directory 'safe-local-variable 'stringp)

(defvar-local cmakeproject-build-directory nil)
(put 'cmakeproject-build-directory 'safe-local-variable 'stringp)

(defun cmakeproject-absolute-path (FILE)
  "Convert relative path to absolute path."
  (let ((root (dir-locals-find-file default-directory)))
    (if (listp root)
        (expand-file-name FILE (car root))
      (expand-file-name FILE root))))

(define-minor-mode cmakeproject-mode
  "CMake based project management."
  :lighter " CMakeProject"
  ;; After processing directory/file local variables,
  ;; determine source and build directory.
  (add-hook 'hack-local-variables-hook
            (lambda ()
              (message "CMake source directory: %s"
                       (cmakeproject-absolute-path cmakeproject-source-directory))
              (message "CMake build directory: %s"
                       (cmakeproject-absolute-path cmakeproject-build-directory))
              ;; Set compile command.
              (setq-local compile-command
                          (concat "cmake --build "
                                  (cmakeproject-absolute-path
                                   cmakeproject-build-directory)))
              ;; Configure Irony mode.
              (when (package-installed-p 'irony)
                (irony-cdb-json-add-compile-commands-path
                 (cmakeproject-absolute-path cmakeproject-source-directory)
                 (expand-file-name "compile_commands.json"
                                   (cmakeproject-absolute-path
                                    cmakeproject-build-directory)))
                (irony-cdb-autosetup-compile-options)))
            nil t))

(add-hook 'c++-mode-hook #'cmakeproject-mode)

(provide 'cmakeproject-mode)
