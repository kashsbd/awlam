import React from 'react';
import { Platform, Linking } from 'react-native';
import {
    createDrawerNavigator,
    createStackNavigator,
    createSwitchNavigator
} from 'react-navigation';

import * as Screens from './screens';
import { bootstrap } from './config/bootstrap';
import { scale } from './utils/scale';

bootstrap();
console.disableYellowBox = true;

const SideMenu = Screens.SideMenu;

const PostStack = createStackNavigator(
    {
        Post: { screen: Screens.PostList },
        EachPost: { screen: Screens.EachPost },
        PostUpload: { screen: Screens.PostUpload },
        ArticleUpload: { screen: Screens.ArticleUpload },
        Noti: { screen: Screens.Notification },
        Search: { screen: Screens.SearchPage }
    }
);

const GovernmentStack = createStackNavigator(
    {
        GovernmentList: { screen: Screens.GovernmentList },
        EachGovernment: { screen: Screens.EachGovernment },
        CreateGovernment: { screen: Screens.CreateGovernment }
    }
);

const ArticleStack = createStackNavigator(
    {
        ArticleList: { screen: Screens.ArticleLists },
        EachArticle: { screen: Screens.Article },
        ArticleUpload: { screen: Screens.ArticleUpload },
    }
);

const ProfileStack = createStackNavigator(
    {
        MainProfile: { screen: Screens.Profile }
    }
);

const EventStack = createStackNavigator(
    {
        EventList: { screen: Screens.EventList },
        EachEvent: { screen: Screens.EachEvent },
        SubEventList: { screen: Screens.SubEventPostList },
        CreateEvent: { screen: Screens.CreateEvent },
        CreateEventPost: { screen: Screens.CreateEventPost }
    }
);

const CitizenStack = createStackNavigator(
    {
        CitizenList: { screen: Screens.CitizenList },
        EachCitizen: { screen: Screens.EachCitizen },
        SubCitizenList: { screen: Screens.SubCitizenPostList },
        CreateCitizen: { screen: Screens.CreateCitizen },
        CreateCitizenPost: { screen: Screens.CreateCitizenPost }
    }
);

const TopicStack = createStackNavigator(
    {
        TopicList: { screen: Screens.TopicList },
        EachTopic: { screen: Screens.EachTopic },
        SubTopicList: { screen: Screens.SubTopicList },
        CreateTopic: { screen: Screens.CreateTopic },
        CreateSubTopic: { screen: Screens.CreateSubTopic }
    }
);

const UserStack = createStackNavigator(
    {
        CreateUser: { screen: Screens.CreateUser }
    }
)

const NavigationDrawer = createDrawerNavigator(
    {
        Post: { screen: PostStack },
        Article: { screen: ArticleStack },
        Profile: { screen: ProfileStack },
        Event: { screen: EventStack },
        Citizen: { screen: CitizenStack },
        Topic: { screen: TopicStack },
        Government: { screen: GovernmentStack },
        User: { screen: UserStack }
    },
    {
        drawerOpenRoute: 'DrawerOpen',
        drawerCloseRoute: 'DrawerClose',
        drawerToggleRoute: 'DrawerToggle',
        contentComponent: props => <SideMenu {...props} />,
        drawerWidth: scale(320)
    }
);


const AuthStack = createStackNavigator(
    {
        SignIn: { screen: Screens.Login },
        SignUp: { screen: Screens.SignUp }
    }
);

const MainApp = createSwitchNavigator(
    {
        AuthLoading: { screen: Screens.SplashScreen },
        App: { screen: NavigationDrawer },
        Auth: { screen: AuthStack }
    },
    {
        initialRouteName: 'AuthLoading',
    }
);

export default class App extends React.Component {

    render() {
        return <MainApp />
    }
};

