(() => {
    let userId = null;
    let userName = null;
    let userColor = null;
    let ignoreDataFusionLazyIds = ['Subhome']

    // Load Socket.io client
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/3.1.3/socket.io.min.js';
    script.integrity = 'sha384-cPwlPLvBTa3sKAgddT6krw0cJat7egBga3DJepJyrLl4Q9/5WLra3rrnMcyTyOnh';
    script.crossOrigin = 'anonymous';
    script.onload = initializeTracking;
    document.head.appendChild(script);

    function getRandomMarvelName() {
        const names = [
            'Spider-Man', 'Iron Man', 'Thor', 'Black Widow', 'Captain America',
            'Hulk', 'Black Panther', 'Vision', 'Scarlet Witch', 'Hawkeye',
            'Ant-Man', 'Wasp', 'Spider-Woman', 'Doctor Strange', 'Black Panther',
            'Vision', 'Scarlet Witch', 'Hawkeye', 'Ant-Man', 'Wasp',
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    function getRandomColor() {
        const colors = [
            "#FF6F61", // Coral suave
            "#6C5CE7", // Roxo violeta moderno
            "#00CEC9", // Azul piscina
            "#FAB1A0", // Rosa claro pastel
            "#55EFC4", // Verde menta
            "#0984E3", // Azul vibrante
            "#FFEAA7", // Amarelo manteiga
            "#FF7675", // Rosa salmão
            "#81ECEC", // Ciano pastel
            "#74B9FF", // Azul bebê moderno
            "#A29BFE", // Lilás suave
            "#636E72", // Cinza grafite moderno
            "#E17055", // Laranja queimado
            "#D63031", // Vermelho vibrante
            "#FD79A8", // Pink chiclete
            "#E84393", // Rosa forte elegante
            "#2D3436", // Preto carvão
            "#00B894", // Verde esmeralda
            "#ECCC68", // Mostarda suave
            "#5352ED"  // Azul safira moderno
          ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function getRandomMarvelName() {
        const marvelCharacters = [
            'Iron Man', 'Captain America', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye',
            'Spider-Man', 'Doctor Strange', 'Black Panther', 'Captain Marvel',
            'Scarlet Witch', 'Vision', 'Ant-Man', 'Star-Lord', 'Groot', 'Rocket',
            'Gamora', 'Drax', 'Loki', 'Winter Soldier', 'Falcon', 'War Machine',
            'Wong', 'Wasp', 'Shuri', 'Nick Fury', 'Maria Hill', 'Valkyrie',
            'Okoye', 'Nebula', 'Mantis', 'Quicksilver', 'Professor X', 'Wolverine'
        ];
        return marvelCharacters[Math.floor(Math.random() * marvelCharacters.length)];
    }

    function removeChildElement(element, byClassName){
        Array.from(element.children).find(e => e.classList.contains(byClassName)).remove();
    }

    function createMarkerElement(color, text){
        const marker = document.createElement('div');
        marker.style.cssText = `
            position: absolute;
            pointer-events: none;
            z-index: 9999;
            top: -20px;
            left: -20px;
            width: auto;
            color: white;
            font-size: 12px;
            height: 30px;
            align-content: center;
            background-color: ${color};
            border: 2px solid ${color};
            padding: 0 10px;
            border-radius: 10px;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
            transition: all 0.1s ease;
        `;
        marker.textContent = `${text} - Editando...`;
        marker.classList.add('user-marker');
        return marker;
    }

    function createUserCounter() {
        const counter = document.createElement('div');
        counter.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        const icon = document.createElement('div');
        icon.innerHTML = '👥';
        icon.style.fontSize = '16px';

        const count = document.createElement('span');
        count.textContent = '1 Usuário ativo';

        const list = document.createElement('div');
        list.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 5px;
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 8px;
            display: none;
            min-width: 150px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        counter.appendChild(icon);
        counter.appendChild(count);
        counter.appendChild(list);

        counter.addEventListener('mouseenter', () => list.style.display = 'block');
        counter.addEventListener('mouseleave', () => list.style.display = 'none');

        return { counter, count, list };
    }

    function SocketOnElementClick(data){
        if (data.userId === userId && !data.isClickExternal) return;

        const elements = document.querySelectorAll('[data-fusion-lazy-id]');
        if (elements[data.elementIndex]) {
            if(data.isElementActived){
                elements[data.elementIndex].style.border = `2px solid ${data.color}`;
                elements[data.elementIndex].appendChild(createMarkerElement(data.color, data.userName));
                elements[data.elementIndex].setAttribute('data-element-id', `${data.userId}:clicked`);
            }else{
                elements[data.elementIndex].style.border = '';
                elements[data.elementIndex].style.boxShadow = '';
                removeChildElement(elements[data.elementIndex], 'user-marker');
                elements[data.elementIndex].removeAttribute('data-element-id');
            }

            Array.from(elements).forEach(element => {
                if(element.getAttribute('data-element-id') === `${data.userId}:clicked` && element !== elements[data.elementIndex]){
                    element.style.border = '';
                    element.style.boxShadow = '';
                    removeChildElement(element, 'user-marker');
                    element.removeAttribute('data-element-id');
                }
            });
        }
    }

    function initializeTracking() {
        const socket = io('http://localhost:3000');
        userId = Math.random().toString(36).substring(7);
        userName = getRandomMarvelName();
        userColor = getRandomColor(); 

        // Create and add user counter
        const { counter, count, list } = createUserCounter();
        document.body.appendChild(counter);

        // Create cursor container
        const cursorContainer = document.createElement('div');
        cursorContainer.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.1s ease;
        `;

        // Create cursor element
        const cursor = document.createElement('div');
        cursor.style.cssText = `
            width: 12px;
            height: 12px;
            background-color: ${userColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
        `;

        // Create name tag
        const nameTag = document.createElement('div');
        nameTag.style.cssText = `
            background-color: ${userColor};
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            margin-left: 15px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transform: translateY(-50%);
        `;
        nameTag.textContent = userName;

        // Assemble cursor components
        cursorContainer.appendChild(cursor);
        cursorContainer.appendChild(nameTag);
        document.body.appendChild(cursorContainer);

        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            const rect = document.body.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            cursorContainer.style.left = x + 'px';
            cursorContainer.style.top = y + 'px';

            socket.emit('cursor-move', {
                userId,
                userName,
                x,
                y,
                color: userColor
            });
        });

        function handleElementClick(elementTarget, elementId) {
            if (elementTarget) {
                let elementActived = true;
                if(elementId === `${userId}:clicked`){
                    elementActived = false;
                    elementTarget.removeAttribute('data-element-id');
                    elementTarget.style.border = '';
                    elementTarget.style.boxShadow = '';
                    removeChildElement(elementTarget, 'user-marker');
                }else{
                    Array.from(document.querySelectorAll('[data-fusion-lazy-id]')).forEach(element => {
                        if(element.getAttribute('data-element-id') === `${userId}:clicked`){
                            element.removeAttribute('data-element-id');
                            element.style.border = '';
                            element.style.boxShadow = '';
                            removeChildElement(element, 'user-marker');
                        }
                    });
                    elementTarget.style.border = `3px solid ${userColor}`;
                    elementTarget.style.position = 'relative';
                    elementTarget.appendChild(createMarkerElement(userColor, userName));
                    elementTarget.setAttribute('data-element-id', `${userId}:clicked` );
                }

                socket.emit('element-click', {
                    userId,
                    userName,
                    isElementActived: elementActived,
                    elementIndex: Array.from(document.querySelectorAll('[data-fusion-lazy-id]')).indexOf(elementTarget),
                    color: userColor
                });
            }
        }

        // Listen for messages from content script
        window.addEventListener('message', (event) => {
            if (event.data.type === 'ELEMENT_CLICK') {
                const { fingerprintId } = event.data.data;
                const elementTarget = document.querySelector(`[data-fusion-lazy-id="${fingerprintId}"]`)
                const elementId = elementTarget.getAttribute('data-element-id')

                if(elementId === `${userId}:clicked`) return

                handleElementClick(elementTarget, elementId)
            }
        });

        // Track clicks
        document.addEventListener('click', (e) => {
            let elementTarget = e.target.closest('[data-fusion-lazy-id]')
            let parentElementGetDataFusionLazyId = elementTarget.getAttribute('data-fusion-lazy-id');
            let elementId = elementTarget.getAttribute('data-element-id');

            //ignore data-fusion-lazy-id
            if(ignoreDataFusionLazyIds.includes(parentElementGetDataFusionLazyId)) return

            // ignore [data-element-id] of other users
            if(elementId && (elementId !== `${userId}:clicked` || elementId === `${userId}:clicked`)) return 

            handleElementClick(elementTarget, elementId)
        });

        // Handle other users' cursors
        const cursors = new Map();

        socket.on('cursor-move', (data) => {
            if (data.userId === userId) return;

            let otherCursor = cursors.get(data.userId);
            if (!otherCursor) {
                otherCursor = cursorContainer.cloneNode(true);
                const nameTag = otherCursor.querySelector('div:last-child');
                nameTag.textContent = data.userName || 'Unknown Hero';
                nameTag.style.backgroundColor = data.color;
                const cursorDot = otherCursor.querySelector('div:first-child');
                cursorDot.style.backgroundColor = data.color;
                document.body.appendChild(otherCursor);
                cursors.set(data.userId, otherCursor);
            }

            otherCursor.style.left = data.x + 'px';
            otherCursor.style.top = data.y + 'px';
        });

        socket.on('element-click', (data) => {
            SocketOnElementClick(data)
        });

        // Send user initialization
        socket.emit('user-init', { userId, userName, color: userColor, pathname: window.location.pathname });

        // Handle user count updates
        socket.on('user-count-update', (data) => {
            count.textContent = `${data.count} ${data.count === 1 ? 'usuário ativo' : 'usuários ativos'}`;
            
            // Update user list
            list.innerHTML = '';
            data.users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.style.cssText = `
                    padding: 4px 8px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border-radius: 4px;
                    margin: 2px 0;
                `;
                
                const userDot = document.createElement('span');
                userDot.style.cssText = `
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: ${user.color};
                `;
                
                const userName = document.createElement('span');
                userName.textContent = user.userName;
                
                userItem.appendChild(userDot);
                userItem.appendChild(userName);
                list.appendChild(userItem);
            });
        });

        socket.on('user-init', (data) => {
            console.log("user-init", data)
        })

        // Handle new users joining
        socket.on('user-joined', (data) => {
            // Create cursor for new user if they're not already tracked
            if (!cursors.has(data.userId)) {
                const newCursor = cursorContainer.cloneNode(true);
                const nameTag = newCursor.querySelector('div:last-child');
                nameTag.textContent = data.userName;
                nameTag.style.backgroundColor = data.color;
                const cursorDot = newCursor.querySelector('div:first-child');
                cursorDot.style.backgroundColor = data.color;
                document.body.appendChild(newCursor);
                cursors.set(data.userId, newCursor);
            }
        });

        // Handle other users disconnecting
        socket.on('user-disconnected', (data) => {
            const disconnectedCursor = cursors.get(data.userId);
            if (disconnectedCursor) {
                disconnectedCursor.remove();
                cursors.delete(data.userId);
            }

            // Remove any highlights made by the disconnected user
            document.querySelectorAll('[data-element-id]').forEach(element => {
                if(element.getAttribute('data-element-id') === `${data.userId}:clicked`){
                    element.removeAttribute('data-element-id');
                    element.style.border = '';
                    element.style.boxShadow = '';
                    removeChildElement(element, 'user-marker');
                }
            });
        });

        // Clean up when user leaves
        window.addEventListener('beforeunload', () => {
            socket.disconnect();
        });
    }
})();
