Include `all` file to the global git config file like below.

```
[include]
    path = gitconfig/all
```

[About include directive in git config file.](https://git-scm.com/docs/git-config#_includes)

You can find where your git config files are with the following command:
```
git config -l --show-origin
```