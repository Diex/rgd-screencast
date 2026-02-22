import { useCallback, useMemo } from 'react';
import {
	AppBar,
	Authenticator,
	CircularProgressCenter,
	Drawer,
	FireCMS,
	ModeControllerProvider,
	NavigationRoutes,
	Scaffold,
	SideDialogs,
	SnackbarProvider,
	useBuildLocalConfigurationPersistence,
	useBuildModeController,
	useBuildNavigationController,
	useValidateAuthenticator
} from '@firecms/core';
import {
	FirebaseAuthController,
	FirebaseLoginView,
	FirebaseSignInProvider,
	FirebaseUserWrapper,
	useFirebaseAuthController,
	useFirebaseStorageSource,
	useFirestoreDelegate,
	useInitialiseFirebase
} from '@firecms/firebase';
import { CenteredView } from '@firecms/ui';
import { gamesCollection } from './collections/games';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export default function App() {
	const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(
		async ({ user }) => {
			console.log('Allowing access to', user);
			return true;
		},
		[]
	);

	const collections = useMemo(() => [gamesCollection], []);

	const { firebaseApp, firebaseConfigLoading, configError } = useInitialiseFirebase({
		firebaseConfig
	});

	const modeController = useBuildModeController();

	const signInOptions: FirebaseSignInProvider[] = ['google.com'];

	const authController: FirebaseAuthController = useFirebaseAuthController({
		firebaseApp,
		signInOptions
	});

	const userConfigPersistence = useBuildLocalConfigurationPersistence();

	const firestoreDelegate = useFirestoreDelegate({
		firebaseApp
	});

	const storageSource = useFirebaseStorageSource({
		firebaseApp
	});

	const { authLoading, canAccessMainView, notAllowedError } = useValidateAuthenticator({
		authController,
		authenticator: myAuthenticator,
		dataSourceDelegate: firestoreDelegate,
		storageSource
	});

	const navigationController = useBuildNavigationController({
		disabled: authLoading,
		collections,
		authController,
		dataSourceDelegate: firestoreDelegate
	});

	if (firebaseConfigLoading || !firebaseApp) {
		return <CircularProgressCenter />;
	}

	if (configError) {
		return <CenteredView>{configError}</CenteredView>;
	}

	return (
		<SnackbarProvider>
			<ModeControllerProvider value={modeController}>
				<FireCMS
					navigationController={navigationController}
					authController={authController}
					userConfigPersistence={userConfigPersistence}
					dataSourceDelegate={firestoreDelegate}
					storageSource={storageSource}
				>
					{({ loading }) => {
						if (loading || authLoading) {
							return <CircularProgressCenter size={'large'} />;
						}

						if (!canAccessMainView) {
							return (
								<FirebaseLoginView
									authController={authController}
									firebaseApp={firebaseApp}
									signInOptions={signInOptions}
									notAllowedError={notAllowedError}
								/>
							);
						}

						return (
							<Scaffold autoOpenDrawer={false}>
								<AppBar title={'RGD Screencast Admin'} />
								<Drawer />
								<NavigationRoutes />
								<SideDialogs />
							</Scaffold>
						);
					}}
				</FireCMS>
			</ModeControllerProvider>
		</SnackbarProvider>
	);
}
