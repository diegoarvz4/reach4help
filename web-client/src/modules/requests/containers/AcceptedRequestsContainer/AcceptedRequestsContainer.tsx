import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ProfileState } from 'src/ducks/profile/types';
import { getAcceptedRequests } from 'src/ducks/requests/actions';
import { RequestState } from 'src/ducks/requests/types';
import { ApplicationPreference } from 'src/models/users';
import { TimelineAcceptedViewLocation } from 'src/modules/timeline/pages/routes/TimelineAcceptedViewRoute/constants';

import AcceptedRequestItem from '../../components/AcceptedRequestItem/AcceptedRequestItem';
import Header from '../../components/Header/Header';
import RequestList from '../../components/RequestList/RequestList';

const OpenRequestsContainer: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const profileState = useSelector(
    ({ profile }: { profile: ProfileState }) => profile,
  );

  const acceptedRequestsWithOffersAndTimeline = useSelector(
    ({ requests }: { requests: RequestState }) =>
      requests.syncAcceptedRequestsState,
  );

  useEffect(() => {
    if (profileState.profile && profileState.profile.applicationPreference) {
      dispatch(
        getAcceptedRequests({
          userType: profileState.profile.applicationPreference,
          userRef: profileState.userRef,
        }),
      );
    }
  }, [profileState, dispatch]);

  const handleRequest: Function = id =>
    history.push(TimelineAcceptedViewLocation.toUrl({ requestId: id }));

  return (
    <>
      <Header
        requestsType="Accepted"
        numRequests={
          Object.keys(acceptedRequestsWithOffersAndTimeline.data || {}).length
        }
        isCav={
          profileState.profile?.applicationPreference ===
          ApplicationPreference.cav
        }
        isAcceptedRequests
      />
      <RequestList
        requests={acceptedRequestsWithOffersAndTimeline.data}
        loading={
          acceptedRequestsWithOffersAndTimeline &&
          acceptedRequestsWithOffersAndTimeline.loading
        }
        handleRequest={handleRequest}
        RequestItem={AcceptedRequestItem}
      />
    </>
  );
};

OpenRequestsContainer.propTypes = {};

export default OpenRequestsContainer;
