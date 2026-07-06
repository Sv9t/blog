---
title: "Первое подключение Ansible к хостам"
description: "Как обойти ошибку Host Key checking при первой проверке хостов Ansible: аргумент StrictHostKeyChecking=no и вариант с --ask-become-pass."
pubDate: "2023-10-25"
tags: ["ansible", "devops"]
---

*Испробовано на Ansible ver. 2.3.*

Когда возникла необходимость поменять часть строк в файлах `sudoers` и `hosts` на серверах CentOS 6.8, я решил после настройки playbook'ов сначала пропинговать сервера и проверить, всё ли будет хорошо после запуска Ansible.

Т. к. на вашем сервере (назовём его master) нет отпечатка fingerprint SSH-ключа, при первом подключении вы получите ошибку:

```json
fatal: [server.all.tmp]: FAILED! => {
  "failed": true,
  "msg": "Using a SSH password instead of a key is not possible because Host Key checking is enabled and sshpass does not support this.  Please add this host's fingerprint to your known_hosts file to manage this host."
}
```

Можно использовать аргумент `--ask-become-pass` и вводить каждый раз пароль `root`'а нового хоста. Т. к. я ленивый, при первой проверке хостов пингом я добавил аргумент не проверять ключ. Но он добавится в файл `known_hosts`.

Итак, файл `playping.yml`:

```yaml
---
- name: Ping servers
  hosts: app.all.tmp  # указываете свои хосты или группу хостов

  tasks:
    - name: Ping ip servers
      ping:
```

В файле `hosts` для первого раза указываю все логины и пароли от `root`'а (можно их зашифровать с помощью Vault):

```ini
[app.all.tmp]
app.r.server  ansible_host=192.168.1.100  ansible_user=root  ansible_password=root  ansible_become=true  ansible_become_pass=root
```

- `ansible_user` / `ansible_password` — для подключения через SSH;
- `ansible_become=true` — для входа под пользователем по умолчанию `root`;
- `ansible_become_pass` — пароль `sudo`.

Это также необходимо для редактирования файлов `sudoers` — именно это мне и нужно было.

Запускаем командой:

```bash
ansible-playbook playping.yml --ssh-common-args='-o StrictHostKeyChecking=no'
```

Fingerprint SSH-ключа будет сохранён в файл `known_hosts` вашего пользователя, вручную подтверждать сохранение ключа нет необходимости. Дальше можно приступать к использованию Ansible.
