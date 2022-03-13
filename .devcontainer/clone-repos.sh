#!/usr/bin/env bash
echo "BASH SOURCE: ${BASH_SOURCE[0]}"
script_folder="$(cd $(dirname "${BASH_SOURCE[0]}") && pwd)"
echo "Script folder: ${script_folder}" 
workspaces_folder="$(cd "${script_folder}/../.." && pwd)"
echo "workplaces folder: ${workspaces_folder}" 

clone-repo()
{
    cd "${workspaces_folder}"
    if [ ! -d "$1" ]; then
        git clone "https://github.com/$1"
    else 
        echo "Already cloned $1"
    fi
}

if [ "${CODESPACES}" = "true" ]; then
    echo "Remove the default credential helper"
    sudo sed -i -E 's/helper =.*//' /etc/gitconfig

    echo "Add one that just uses secrets available in the Codespace"
    git config --global credential.helper '!f() { sleep 1; echo "username=${GITHUB_USER}"; echo "password=${GH_TOKEN}"; }; f'
fi

if [ -f "${script_folder}/repos-to-clone.list" ]; then
    while IFS= read -r repository; do
        clone-repo "$repository"
    done < "${script_folder}/repos-to-clone.list"
fi
