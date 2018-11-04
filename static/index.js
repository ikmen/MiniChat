if (!localStorage.getItem('name')) {
    localStorage.setItem('name', '');
}

document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect('http://127.0.0.1:5000');

    var username = localStorage.getItem('name');

    var current_channel;

    if (username == '') {
        var dos = document.createElement('form');
        dos.setAttribute('id', 'name-input');

        var text = document.createElement('input');
        text.setAttribute('type', "text");
        text.setAttribute('id', 'name-text');

        var submit = document.createElement('input');
        submit.setAttribute('type', 'submit');

        dos.appendChild(text);
        dos.appendChild(submit);

        var message = document.createElement('div');
        message.innerHTML = 'You need to input name into the form';
        document.querySelector('body').appendChild(message);
        document.querySelector('body').appendChild(dos);

        document.getElementById('name-input').onsubmit = () => {
            username = document.getElementById('name-text').value;
            localStorage.setItem('name', username);
            var message = document.getElementById('message');
            var dos = document.getElementById('dos');
            alert('PASSING CODE');
            message.parentNode.removeChild(message);
            dos.parentNode.removeChild(dos);

            document.getElementById('nickname').innerHTML = username;
            return false;
        };
    } else {
        document.getElementById('nickname').innerHTML = username;
    };




    socket.on('connect', () => {
        document.getElementById('message').onsubmit = () => {
            var message = document.getElementById('text-input').value;
            document.getElementById('text-input').value = '';
            var date = new Date().toLocaleTimeString();
            socket.emit('got message', {'message': message, 'channel': current_channel, 'date': date, 'user': username});
            return false;
        };
    });

    socket.on('connect', () => {
        document.getElementById('add-channel').onsubmit = () => {
            var new_channel = document.getElementById('channel-name-input').value;
            document.getElementById('channel-name-input').value = '';
            socket.emit('add channel', {'channel': new_channel});
            return false;
        };
    });

    socket.on('add message', (data) => {
        const li = document.createElement('li');
        var time = new Date().toLocaleTimeString();
        li.innerHTML = createMessage(data);
        document.querySelector('#chat').append(li);
    });

    socket.on('broadcast channel', (data) => {
        const channel_button = document.createElement('button');
        channel_button.setAttribute('data-channel', data.channel);
        channel_button.setAttribute('class', "channel");
        channel_button.innerText = data.channel;
        addChannelListener(channel_button);
        document.getElementById('channel-list').appendChild(channel_button);
    });

    document.querySelectorAll('.channel').forEach(button => addChannelListener(button));

    function createMessage(message) {
        return `${message["date"]} ${message["user"]} ${message["message"]}`;
    }

    function addChannelListener(channel_button) {
        channel_button.onclick = () => {
            current_channel = channel_button.innerHTML;
            const request = new XMLHttpRequest();
            request.open('POST', '/select_channel');
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                document.getElementById('chat').innerHTML = '';
                for (i = 0; i < data.channel_name.length; i++) {
                    // const item = data.channel_name[i];
                    const li = document.createElement('li');
                    li.innerHTML = createMessage(data.channel_name[i]);
                    document.getElementById('chat').append(li);
                };
            };

            const data = new FormData();
            data.append('channel-name', current_channel);
            request.send(data);
        };
    };
});