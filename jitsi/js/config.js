document.addEventListener('DOMContentLoaded', () => {
    const api = new JitsiMeetExternalAPI("meet.jit.si", {
        roomName: "<NAME OF ROOM HERE>",
        width: '100%',
        height: '100%',
        parentNode: document.getElementById('meet'),
        configOverwrite: {},
        interfaceConfigOverwrite: {},
        subject: 'Ceci est un sujet de conférence',
        userInfo: {
            displayName: 'Kévin Leroy',
            email: 'victory62190@gmail.com',
            avatarUrl: 'https://fr.gravatar.com/userimage/165663124/d8018f3c23ffc504a4cc2a67d490a8a2.png'
        }
    });

    // VIDEO
    api.executeCommand('setVideoQuality', 720);

    // EVENT
    api.on('videoConferenceJoined', (e) => {
        console.info(
            '%c👤 %s viens de rejoindre la conférence',
            'color: #bada55',
            e.displayName
        );
    });

    api.on('videoConferenceLeft', (e) => {
        console.info(
            '%c👤 %s viens de quitter la conférence',
            'color: #d300000',
            e.displayName
        );
    });

    api.on('readyToClose', () => {
        alert('opaaaaa');
    });

    /*window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        alert('OOOOO');
        return 'are you sure you want to leave?';
    });*/
});
