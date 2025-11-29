在本主题中，我们将开始探索 **Git** —— 一个控制和合并代码版本的必备工具。你将学习 **什么是 Git、为什么需要使用它、如何安装它，以及一些重要的配置设置**。

---

## 什么是 Git？

**Git** 是一种分布式版本控制系统，它帮助开发者跟踪和记录文件的更改。文件可以是任何类型的，但在大多数情况下，Git 主要用于管理软件开发项目中的源代码。

使用 Git，你可以：

- 跟踪文件的每一次修改；
- 在出现错误时回滚 —— 轻松恢复到项目的某个历史版本；
- 对比不同版本的文件，分析发生了哪些变化；
- 与他人同时协作开发同一个项目，更轻松地协调更改；
- 将不同开发者的修改合并到同一个版本中。

这就是所谓的 **版本控制**。文件存储在你硬盘的文件夹中，称为 **仓库（repository，简称 repo）**。Git 中的仓库分为两类：

- **本地仓库（Local repo）**：
  - 仅存在于你计算机的本地存储中；
  - 可以离线独立工作，无需网络连接；
  - 所有修改和历史记录都保存在本地，速度快且高效。
- **远程仓库（Remote repo）**：
  - 存放在网上的仓库副本，通常托管在 GitHub、GitLab 或 Bitbucket 等平台上；
  - 便于通过互联网与他人共享代码、协作开发；
  - 也可以作为备份，保证你的工作安全并随时随地可访问。

Git 的最大特点是 **分布式** —— 每个用户都拥有完整的仓库副本，即使服务器宕机也能恢复。

目前常见的 Git 托管服务包括 **GitHub、Bitbucket、GitLab、Codebase、SourceForge 和 SourceHut**。在本教程中我们主要介绍 **GitHub**，但你完全可以选择其他平台。

Git 是 **免费开源软件**，最初为 Linux 开发，但同时也支持 macOS 和 Windows。接下来，我们学习如何在不同系统上安装 Git。

---

## 安装 Git

### 1. Windows

在 Windows 上有多种方式安装 Git：

- 最简单的是从官网下载安装器，双击运行并根据需要选择配置；
- 如果想要无人值守安装，可以通过 **Chocolatey 包管理器**安装；
- 还可以安装 **GitHub for Windows（GitHub Desktop）**，它同时提供了命令行工具和 GUI 工具。

### 2. Linux

在 Linux 上，你只需打开终端并使用包管理器安装即可：

- Fedora / RHEL / CentOS 系：

```bash
sudo dnf install git-all
```

> 这条命令使用 `dnf` 包管理器安装 Git 及其所有组件。

- Debian / Ubuntu 系：

```bash
sudo apt install git
```

> 这条命令使用 `apt` 包管理器安装 Git。

安装成功后，检查版本：

```bash
git --version
```

示例输出：

```bash
git version 2.33.1
```

这表示 Git 已正确安装。

---

## Git 配置

安装完成后，需要进行一些个性化配置，最重要的是设置 **用户名和邮箱**。它们会附加到每一次提交中，用于标识是谁做了哪些修改。

```bash
git config --global user.name "My Name"
git config --global user.email myEmail@example.com
```

> `--global` 表示对系统上的所有仓库生效。如果只想针对某个项目设置用户名和邮箱，可以去掉 `--global` 并在项目目录下运行命令：

```bash
git config user.name "My Name"
git config user.email projectEmail@example.com
```

查看配置是否生效：

```bash
git config --global --list
```

输出类似：

```bash
user.name=My Name
user.email=myEmail@example.com
```

---

## 其他常用配置

- 设置提交信息的默认编辑器（这里以 VS Code 为例）：

```bash
git config --global core.editor "code"
```

- 修改默认分支名（从 `master` 改为 `main`）：

```bash
git config --global init.defaultBranch main
```

- 忽略文件权限变更：

```bash
git config --global core.fileMode false
```

- 配置换行符，避免跨平台冲突：

```bash
git config --global core.autocrlf true   # Windows
git config --global core.autocrlf input  # macOS/Linux
```

- 为常用命令设置别名：

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
```

## 总结

- Git 是一套命令行工具，用于存储、控制、修改和合并代码。
- 可以在 Windows、Linux 和 macOS 上轻松安装。
- 既能在本地使用，也能通过远程服务（如 GitHub）进行团队协作。
- 配置用户名、邮箱、编辑器等参数，可以让你的 Git 环境更高效、更个性化。
