import Help from 'components/Help';
import HttpStatus from 'components/HttpStatus';
import { Application, CollectionDetail, Landing, Replay, Indexing } from 'containers';


export default () => {
  const routes = [
    {
      path: ':user/:coll(/:rec)',
      name: 'collectionDetail',
      component: CollectionDetail
    },
    {
      path: ':user/:coll/:ts/**',
      name: 'replay',
      component: Replay
    },
    {
      path: 'indexing',
      name: 'indexing',
      component: Indexing
    },
    {
      path: 'help',
      name: 'help',
      component: Help
    },
    {
      path: '*',
      name: 'notfound',
      component: HttpStatus
    }
  ];

  return {
    path: '/',
    component: Application,
    indexRoute: {
      component: Landing,
    },
    childRoutes: routes
  };
};
