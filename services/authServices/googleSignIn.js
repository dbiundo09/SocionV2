import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import postSignIn from '../userServices/postSignIn';

const signIn = async () => {

    try {
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const signInResult = await GoogleSignin.signIn();

        // Try the new style of google-sign in result, from v13+ of that module
        idToken = signInResult.data?.idToken;
        if (!idToken) {
            // if you are using older versions of google-signin, try old style result
            idToken = signInResult.idToken;
        }
        if (!idToken) {
            throw new Error('No ID token found');
        }

        const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.idToken);


        await auth().signInWithCredential(googleCredential);
        await postSignIn();
    } catch (error) {
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.IN_PROGRESS:

                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:

                    break;
                default:
            }
        } else {
            console.log(error);
        }
    }
};

export default signIn;