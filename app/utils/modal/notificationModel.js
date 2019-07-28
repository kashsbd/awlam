export class NotificationModel {
    constructor(noti) {
        this.id = noti._id;
        this.type = noti.type;
        this.description = this.getDescription(noti.type);
        this.username = noti.createdBy.name;
        this.userId = noti.createdBy._id;
        this.dataId = noti.dataId;
        this.createdAt = noti.createdAt;
        this.isViewed = false;

        this.setMedia(noti.media);
    }

    setMedia(media) {
        if (media) {
            this.media = {
                mediaId: media._id,
                contentType: media.contentType
            }
        }
    }

    getDescription(type) {
        switch (type) {
            //noti types for post
            case 'CREATE-POST': {
                return 'created a new post.';
                break;
            }
            case 'COMMENT-POST': {
                return 'commented on your post.';
                break;
            }
            case 'LIKE-POST': {
                return 'liked your post.';
                break;
            }
            case 'MENTION-POST': {
                return 'mentioned you in a post.';
                break;
            }
            //noti types for citizen
            case 'APPROVE-CITIZEN': {
                return ', your post is approved.';
                break;
            }
            case 'CREATE-SUBCITIZEN': {
                return 'followed up on your citizen post.';
                break;
            }
            case 'COMMENT-CITIZEN': {
                return 'commented on your citizen post.';
                break;
            }
            case 'COMMENT-SUBCITIZEN': {
                return 'commented on your citizen post.';
                break;
            }
            case 'LIKE-CITIZEN': {
                return 'liked your citizen post.';
                break;
            }
            case 'LIKE-SUBCITIZEN': {
                return 'liked your citizen post.';
                break;
            }
            case 'MENTION-CITIZEN': {
                return 'mentioned you on a citizen post.';
                break;
            }
            case 'MENTION-SUBCITIZEN': {
                return 'mentioned you on a citizen post.';
                break;
            }
            //noti types for topic
            case 'INVITE-TOPIC': {
                return 'invited you in a topic.';
                break;
            }
            case 'CREATE-SUBTOPIC': {
                return 'followed up on your topic post.';
                break;
            }
            case 'COMMENT-TOPIC': {
                return 'commented on your topic post.';
                break;
            }
            case 'COMMENT-SUBTOPIC': {
                return 'commented on your topic post.';
                break;
            }
            case 'LIKE-TOPIC': {
                return 'liked your topic post.';
                break;
            }
            case 'LIKE-SUBTOPIC': {
                return 'liked your topic post.';
                break;
            }
            case 'MENTION-TOPIC': {
                return 'mentioned you on a topic post.';
                break;
            }
            case 'MENTION-SUBTOPIC': {
                return 'mentioned you on a topic post.';
                break;
            }
            //noti types for events
            case 'CREATE-EVENT': {
                return 'created an event.';
                break;
            }
        }
    }
}
