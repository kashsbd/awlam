import Realm from 'realm';

let mediaSchema = {
    name: 'Media',
    properties: {
        mediaId: 'string',
        contentType: 'string'
    }
}

let notificationSchema = {
    name: 'Notification',
    primaryKey: 'id',
    properties: {
        id: { type: 'string', indexed: true },
        type: 'string',
        description: 'string',
        username: 'string',
        userId: 'string',
        media: 'Media?',//optional media field
        dataId: 'string',
        createdAt: 'date',
        isViewed: 'bool'
    }
};

let repository = new Realm({
    schema: [mediaSchema, notificationSchema]
});

let NotificationService = {
    findAll: function () {
        return repository.objects('Notification').sorted('createdAt', true);
    },

    save: function (noti) {
        // if (repository.objects('Notification').filtered("rnMedia.mediaId = '" + noti.rnMedia.mediaId + "'").length) return;
        repository.write(() => {
            try {
                repository.create('Notification', noti);
            } catch (err) {
                console.log(err);
            }
        })
    },

    updateIsView: function (callback) {
        if (!callback) return;
        repository.write(() => {
            callback(repository);
        });
    },

    deleteAll: function () {
        repository.write(() => {
            repository.deleteAll();
        });
    }
};

export { NotificationService };