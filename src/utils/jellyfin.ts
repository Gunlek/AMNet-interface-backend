import axios, { AxiosError } from "axios";

export class Gadzflix {
    static config = null;

    static getConfig() {
        if (Gadzflix.config == null) {
            const AuthString = "MediaBrowser Client=Interface-Web, Device=Interface, DeviceId=47, Version=102, Token=" + process.env.GADZFLIX_TOKEN;
            Gadzflix.config = {
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json",
                    "X-Application": "Interface/102",
                    "Accept-Charset": "UTF-8,*",
                    "Accept-encoding": "gzip",
                    "User-Agent": "Interface/102",
                    "X-Emby-Authorization": AuthString
                }
            }
        } else {
            return Gadzflix.config;
        }
    }

    private static URL = "https://gadzflix.fr"
    private static policy = {
        "IsAdministrator": false,
        "IsHidden": true,
        "IsDisabled": true,
        "BlockedTags": [],
        "EnableUserPreferenceAccess": true,
        "AccessSchedules": [],
        "BlockUnratedItems": [],
        "EnableRemoteControlOfOtherUsers": false,
        "EnableSharedDeviceControl": true,
        "EnableRemoteAccess": true,
        "EnableLiveTvManagement": false,
        "EnableLiveTvAccess": false,
        "EnableMediaPlayback": true,
        "EnableAudioPlaybackTranscoding": true,
        "EnableVideoPlaybackTranscoding": true,
        "EnablePlaybackRemuxing": true,
        "ForceRemoteSourceTranscoding": false,
        "EnableContentDeletion": false,
        "EnableContentDeletionFromFolders": [],
        "EnableContentDownloading": false,
        "EnableSyncTranscoding": true,
        "EnableMediaConversion": true,
        "EnabledDevices": [],
        "EnableAllDevices": true,
        "EnabledChannels": [],
        "EnableAllChannels": false,
        "EnabledFolders": [
            "db4c1708cbb5dd1676284a40f2950aba",
            "d565273fd114d77bdf349a2896867069"
        ],
        "EnableAllFolders": false,
        "InvalidLoginAttemptCount": 0,
        "LoginAttemptsBeforeLockout": 3,
        "MaxActiveSessions": 2,
        "EnablePublicSharing": true,
        "BlockedMediaFolders": [],
        "BlockedChannels": [],
        "RemoteClientBitrateLimit": 0,
        "AuthenticationProviderId": "Jellyfin.Server.Implementations.Users.DefaultAuthenticationProvider",
        "PasswordResetProviderId": "Jellyfin.Server.Implementations.Users.DefaultPasswordResetProvider",
        "SyncPlayAccess": "None"
    }

    static async changePassword(userid: string, newpass: string) {
        await axios.post(`${Gadzflix.URL}/Users/${userid}/Password`, { "ResetPassword": true }, Gadzflix.config)
        .catch((reason: AxiosError) => {
            if (reason.response.status !== 204) {
                console.log(reason.message)
            }
        })
        
        await axios.post(`${Gadzflix.URL}/Users/${userid}/Password`, { "NewPw": newpass, "ResetPassword": false }, Gadzflix.config)
        .catch((reason: AxiosError) => {
            if (reason.response.status !== 204) {
                console.log(reason.message)
            }
        })
    }

    static async removeUser(userid: string) {
        await axios.delete(`${Gadzflix.URL}/Users/${userid}`, Gadzflix.config)
        .catch((reason: AxiosError) => {
            if (reason.response.status !== 204) {
                console.log(reason.message)
            }
        })
    }

    static async createUser(name: string, password: string) {
        const req = await axios.post(`${Gadzflix.URL}/Users/New`, { "Name": name, "Password": password }, Gadzflix.config
        )
        .catch((reason: AxiosError) => {
            if (reason.response.status !== 204) {
                console.log(reason.message)
            }
        })

        const userid = await req['data']['Id']

        await axios.post(`${Gadzflix.URL}/Users/${userid}/Policy`, Gadzflix.policy, Gadzflix.config)
        .catch((reason: AxiosError) => {
            if (reason.response.status !== 204) {
                console.log(reason.message)
            }
        })

        return userid
    }

    static async setIsDisabled(userid: string, disabled: boolean) {
        const newUserPolicy = { ...Gadzflix.policy }
        newUserPolicy["IsDisabled"] = disabled

        await axios.post(`${Gadzflix.URL}/Users/${userid}/Policy`, newUserPolicy, Gadzflix.config)
        .catch((reason: AxiosError) => {
            if (reason.response.status !== 204) {
                console.log(reason.message)
            }
        })
    }

    static async getUsers() {
        return await axios.get(`${Gadzflix.URL}/Users`, Gadzflix.config)
        .catch((reason: AxiosError) => {
            if (reason.response.status !== 204) {
                console.log(reason.message)
            }
        })
    }
}