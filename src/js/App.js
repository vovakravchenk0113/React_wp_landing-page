import React, { Component } from 'react';
import { HashRouter , Route } from 'react-router-dom'
import Posts from './pages/Posts'
import Login from './pages/Login'
import Splash from './pages/Splash'
import Confirmation from './pages/Confirmation'
import Confirm from './pages/Confirm'
import Tutorial from './pages/Tutorial'
import AddTag from './pages/AddTag'
import AddCategory from './pages/AddCategory';
import { Container } from 'semantic-ui-react'
import './App.css';
import { login } from './api'
import SearchPosts from './pages/SearchPosts';
import Signin from './pages/Signin';

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
}

class App extends Component
{
  render()
  {
    return (
      <HashRouter >
        <Container className='zero-padding fill-screen'>
          <PropsRoute exact path='/' component={Splash}/>
          <PropsRoute exact path='/login' component={Login}/>
          <PropsRoute exact path='/signin' component={Signin}/>
          <PropsRoute exact path='/confirmation' component={Confirmation}/>
          <PropsRoute path='/confirm' component={Confirm}/>
          <PropsRoute exact path='/welcome' component={Tutorial}/>
          <PropsRoute exact path='/posts' component={Posts}/>
          <PropsRoute exact path='/add-tag' component={AddTag}/>
          <PropsRoute exact path='/add-category' component={AddCategory}/>
          <PropsRoute exact path='/search-posts' component={SearchPosts}/>
        </Container>
      </HashRouter>
    );
  }
}

export default App;
