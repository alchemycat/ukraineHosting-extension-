window.onload = () => {
    //значения хранилища

    async function init() {
        const domainId = document.querySelector('[name="domainid"]');
        const emailsInput = document.querySelector('[name="emails"]');

        domainId.addEventListener('input', () => {
            chrome.storage.local.set({ tempdomainId: domainId.value });
        });

        emailsInput.addEventListener('input', () => {
            chrome.storage.local.set({ tempemails: emailsInput.value });
        });

        const { tempdomainId } = await getStorageData('tempdomainId');
        const { tempemails } = await getStorageData('tempemails');

        if (tempdomainId) {
            domainId.value = tempdomainId;
        }

        if (tempemails) {
            emailsInput.value = tempemails;
        }

        //Константы
        const { accountid } = await getStorageData('accountid');
        let { tasks } = await getStorageData('tasks');
        const { status } = await getStorageData('status');

        const btn = document.querySelector('.btn__start');

        if (!Array.isArray(tasks) || !tasks.length) {
            const caption = document.querySelector('.caption');

            chrome.storage.local.set({ tasks: [] });
            btn.setAttribute('disabled', true);
            caption.classList.add('hidden');
        } else {
            //Добавляем задания в список
            console.log(status);
            if (status) {
                if (!status.process) {
                    btn.removeAttribute('disabled', true);
                }
            }
            const caption = document.querySelector('.caption');
            if (caption.classList.contains('hidden')) {
                caption.classList.remove('hidden');
            }
            addItems(tasks);
        }
        //

        const accountIdInput = document.querySelector('[name="accountid"]');

        if (accountid) {
            accountIdInput.value = accountid;
        }

        accountIdInput.addEventListener('input', () => {
            chrome.storage.local.set({ accountid: accountIdInput.value });
        });

        function addItems(tasks) {
            const list = document.querySelector('.main__list');

            list.innerHTML = '';

            tasks.forEach((task, i) => {
                const item = document.createElement('div');
                item.classList.add('main__item');
                item.textContent = `${i + 1}. ${task.domainId}`;
                list.append(item);
            });
        }

        const clearBtn = document.querySelector('.button__clear');

        clearBtn.addEventListener('click', async () => {
            const caption = document.querySelector('.caption');
            const list = document.querySelector('.main__list');
            const btnStart = document.querySelector('.btn__start');

            if (!caption.classList.contains('hidden')) {
                caption.classList.add('hidden');
            }

            chrome.storage.local.remove('tasks');

            const { tasks } = await getStorageData('tasks');

            console.log(tasks);

            list.innerHTML = '';

            if (!btnStart.getAttribute('disabled')) {
                btnStart.setAttribute('disabled', true);
            }
        });

        const mainBtn = document.querySelector('.button__add');

        mainBtn.addEventListener('click', async () => {
            const btnStart = document.querySelector('.btn__start');
            const domainId = document.querySelector('[name="domainid"]');
            const emailsInput = document.querySelector('[name="emails"]');

            let { tasks } = await getStorageData('tasks');

            const errors = [];

            const emails = emailsInput.value.split('\n');

            if (!tasks) {
                tasks = [];
            }

            let domainIdError = domainId.parentElement.querySelector('.error');

            if (!domainIdError.classList.contains('hidden')) {
                domainIdError.classList.add('hidden');
            }

            if (!domainId.value) {
                domainIdError.classList.remove('hidden');
                errors.push('domainId');
            }

            let emailError = emailsInput.parentElement.querySelector('.error');

            if (!emailError.classList.contains('hidden')) {
                emailError.classList.add('hidden');
            }

            if (!emailsInput.value) {
                emailError.classList.remove('hidden');
                errors.push('emails');
            }

            if (errors.length > 0) {
                return;
            } else {
                tasks.push({ domainId: domainId.value, emails });

                chrome.storage.local.set({
                    tasks,
                });

                const caption = document.querySelector('.caption');

                if (caption.classList.contains('hidden')) {
                    caption.classList.remove('hidden');
                }

                addItems(tasks);

                if (btnStart.getAttribute('disabled')) {
                    btn.removeAttribute('disabled');
                }

                domainId.value = '';
                emailsInput.value = '';

                chrome.storage.local.remove('tempdomainId');
                chrome.storage.local.remove('tempemails');
            }
        });

        btn.addEventListener('click', async () => {
            let { tasks } = await getStorageData('tasks');

            if (tasks.length > 0 && accountid) {
                btn.setAttribute('disabled', true);
                chrome.runtime.sendMessage({
                    type: 'startBG',
                    url: `https://adm.tools/hosting/account/${accountid}/mail/boxes/`,
                });
            }
        });

        function getStorageData(sKey) {
            return new Promise(function (resolve, reject) {
                chrome.storage.local.get(sKey, function (item) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError.message);
                        }
                    } else {
                        resolve(item);
                    }
                });
            });
        }
    }

    init();
};
