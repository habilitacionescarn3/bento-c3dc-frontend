import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout/LayoutView';
import { CustomThemeProvider } from './ThemeContext';
import { GlobalProvider } from './Global/GlobalProvider';
import { UserGuideProvider } from '../pages/inventory/sideBar/UserGuideContext';
import NotificationView from './Notifications/NotifactionView';

// This is the place to check login ref to https://medium.com/@tomlarge/private-routes-with-react-router-dom-28e9f40c7146 for sample code

const App = () => (
    <CustomThemeProvider>
        <GlobalProvider>
            <BrowserRouter>
                <UserGuideProvider>
                    <Layout />
                    <NotificationView />
                </UserGuideProvider>
            </BrowserRouter>
        </GlobalProvider>
    </CustomThemeProvider>
);

export default App;