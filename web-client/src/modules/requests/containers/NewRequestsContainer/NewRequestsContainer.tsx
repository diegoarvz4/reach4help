import { firestore } from 'firebase';
import { Coords } from 'google-map-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import {
  getCoordsFromProfile,
  getStreetAddressFromProfile,
} from '../../../../components/WebClientMap/utils';
import Map from '../../../../components/WebClientMap/WebClientMap';
import { ProfileState } from '../../../../ducks/profile/types';
import {
  resetSetRequestState,
  setRequest,
} from '../../../../ducks/requests/actions';
import { RequestState } from '../../../../ducks/requests/types';
import { IUser } from '../../../../models/users';
import { RoleInfoLocation } from '../../../personalData/pages/routes/RoleInfoRoute/constants';
import NewRequest from '../../components/NewRequest/NewRequest';
import RequestConfirmation from '../../components/NewRequest/RequestConfirmation';
import RequestReview, {
  RequestInput,
} from '../../components/NewRequest/RequestReview';
import { OpenRequestsLocation } from '../../pages/routes/OpenRequestsRoute/constants';

const RequestDetails = styled.div`
  width: 100%;
  background: white;
`;

const NewRequestsContainer: React.FC = () => {
  const history = useHistory();

  const [requestInfo, setRequestInfo] = useState<RequestInput | undefined>(
    undefined,
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [showReviewPage, setShowReviewPage] = useState<boolean>(false);

  const [showConfirmationPage, setShowConfirmationPage] = useState<boolean>(
    false,
  );

  const profileState = useSelector(
    ({ profile }: { profile: ProfileState }) => profile,
  );

  const newRequestState = useSelector(
    ({ requests }: { requests: RequestState }) => requests.setAction,
  );

  const [mapAddress, setMapAddress] = useState<string>(
    () =>
      getStreetAddressFromProfile(profileState) || 'Address could not be found',
  );
  const [currentLocation, setCurrentLocation] = useState<Coords>(() =>
    getCoordsFromProfile(profileState),
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (newRequestState.success) {
      setIsSubmitting(false);
      setShowConfirmationPage(true);
      dispatch(resetSetRequestState());
    }
  }, [newRequestState, dispatch]);

  const reviewRequestSubmitHandler = request => {
    if (
      profileState.profile &&
      profileState.userRef &&
      profileState.privilegedInformation
    ) {
      const title =
        request.type === 'Deliveries' ? request.type : request.other;

      dispatch(
        setRequest({
          title,
          description: request.description,
          pinUserRef: profileState.userRef,
          streetAddress: mapAddress || 'Unable to find address',
          pinUserSnapshot: profileState.profile.toObject() as IUser,
          latLng: new firestore.GeoPoint(
            currentLocation.lat,
            currentLocation.lng,
          ),
        }),
      );
      setIsSubmitting(true);
    }
  };

  const newRequestSubmitHandler = (
    type: string,
    body: string,
    address: string,
    other: string,
  ) => {
    setRequestInfo({
      type,
      streetAddress: address,
      description: body,
      other,
    });
    setShowReviewPage(true);
  };

  const [startLocateMe, setStartLocateMe] = useState<boolean>(false);

  const [startGeocode, setStartGeocode] = useState<boolean>(false);
  const setGeocodedLocation = ({ address, latLng }) => {
    setStartGeocode(false);
    setStartLocateMe(false);
    setMapAddress(address);
    setCurrentLocation(latLng);
  };

  const onGoBack = () => setShowReviewPage(false);

  const maybeNewRequest = () => {
    if (!showReviewPage) {
      const request = {
        streetAddress: mapAddress,
        type: requestInfo ? requestInfo.type : 'Deliveries',
        other: requestInfo ? requestInfo.other : '',
        description: requestInfo ? requestInfo.description : '',
      };

      return (
        <RequestDetails>
          <NewRequest
            onSubmit={newRequestSubmitHandler}
            onCancel={() => history.push(RoleInfoLocation.path)}
            request={request}
            setStreetAddress={setMapAddress}
            setMapAddress={() => setStartGeocode(true)}
            setMyLocation={() => setStartLocateMe(true)}
          />
        </RequestDetails>
      );
    }
  };

  const maybeRequestReview = () => {
    if (showReviewPage && requestInfo) {
      return (
        <RequestDetails>
          <RequestReview
            request={requestInfo}
            saveRequest={() => {
              reviewRequestSubmitHandler(requestInfo);
            }}
            isSubmitting={isSubmitting}
            goBack={onGoBack}
          />
        </RequestDetails>
      );
    }
  };

  const maybeRequestConfirmation = () => {
    if (showConfirmationPage) {
      return (
        <RequestConfirmation
          showModal={showConfirmationPage}
          closeModal={() => {
            setShowConfirmationPage(false);
            history.push(OpenRequestsLocation.path);
          }}
        />
      );
    }
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'column',
        }}
      >
        <div style={{ height: '100%' }}>
          <Map
            isCav={false}
            destinations={[]}
            origin={currentLocation}
            onGeocode={setGeocodedLocation}
            address={mapAddress}
            startGeocode={startGeocode}
            startLocateMe={startLocateMe}
          />
        </div>
        <div style={{ marginBottom: '50px' }}>
          {maybeNewRequest()}
          {maybeRequestReview()}
          {maybeRequestConfirmation()}
        </div>
      </div>
    </>
  );
};

NewRequestsContainer.propTypes = {};

export default NewRequestsContainer;
