import { transform, isEqual, isObject } from 'lodash';
import { PermissionStatus, PushNotifications } from '@capacitor/push-notifications';
import { environments } from './Constants';
import { v4 as uuidv4 } from 'uuid';
import { ParticipantResponse, User } from '../interfaces/DataTypes';

export const guid = () => {
    return uuidv4();
};

export const isEmptyObject = (obj: any) => {
    if (obj === undefined || obj === null || obj === '' || obj.length === 0 || obj === false) {
        return true;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export function difference(object: any, base: any) {
    function changes(obj: any, b: any) {
        return transform(obj, function (result: any, value: any, key: any) {
            if (!isEqual(value, b[key])) {
                result[key] = isObject(value) && isObject(b[key]) ? changes(value, b[key]) : value;
            }
        });
    }

    return changes(object, base);
}

export const registerForPush = (userDocId: string, updateParticipantDeviceToken: Function) => {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: any) => {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
            console.log('Push registration success, token: ' + token.value);
        //alert('Push registration success, token: ' + token.value);
        updateParticipantDeviceToken(userDocId, token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (/*notification:any*/) => {
        //alert('Push received: ' + JSON.stringify(notification));
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (/*notification:any*/) => {
        //alert('Push action performed: ' + JSON.stringify(notification));
    });

    return PushNotifications.requestPermissions().then((result: PermissionStatus) => {
        if (result.receive === 'granted') {
            if (process.env.NODE_ENV === environments.DEVELOPMENT)
                console.log('notification permission granted');
            // Register with Apple / Google to receive push via APNS/FCM
            PushNotifications.register(); /*.then(() => {
                fcm
                    .getToken()
                    .then((r) => alert(`Token ${r.token}`))
                    .catch((err) => console.log(err));
            });*/
            return true;
        } else {
            // Show some error
            if (process.env.NODE_ENV === environments.DEVELOPMENT)
                console.log('notification permission denied');
            return false;
        }
    });
};

// Profiles that should show up in 'complete'
export const profilesWithCompletedResponse = (
    questionnaireId: string,
    participantResponses: ParticipantResponse[],
    profile: User
) => {
    const profileIdsWithCompletedResponse = participantResponses
        .filter((r: ParticipantResponse) => {
            return r.questionnaireId === questionnaireId && r.complete === true && r.profileId !== undefined;
        })
        .filter((r: ParticipantResponse) =>
            r.systemGeneratedType ? r.systemGeneratedType !== 'notApplicable' : true
        )
        .map((response: ParticipantResponse) => response.profileId);

    return profile.profiles.filter((p: any) => {
        return profileIdsWithCompletedResponse.includes(p.id);
    });
};

// Profiles that should show up in 'to-do'
export const profilesWithNoCompletedResponse = (
    questionnaireId: string,
    participantResponses: ParticipantResponse[],
    profile: User
) => {
    const profileIdsWithCompletedResponse = participantResponses
        .filter((r: ParticipantResponse) => {
            return r.questionnaireId === questionnaireId && r.profileId !== undefined && r.complete === true;
        })
        .map((response: ParticipantResponse) => response.profileId);

    return profile.profiles.filter((p: any) => {
        return !profileIdsWithCompletedResponse.includes(p.id);
    });
};
