(require 'package)
(defun ensure-package (package)
  "Ensure that PACKAGE is installed."
  (unless (package-installed-p package)
    (package-refresh-contents)
    (package-install package)))

(provide 'ensure-package)
