import { K8sResourceKind } from '@console/internal/module/k8s';

type State = {
  destns: string;
  sourcens: string;
  progress: boolean;
  error: string;
  payload: K8sResourceKind;
};

export const defaultState = {
  destns: '',
  sourcens: '',
  progress: false,
  error: '',
  payload: {},
};

type Action =
  | { type: 'setDestns'; destns: string }
  | { type: 'setSourcens'; sourcens: string }
  | { type: 'setProgress' }
  | { type: 'unsetProgress' }
  | { type: 'setError'; message: string }
  | { type: 'setPayload'; payload: {} };

export const commonReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'setDestns':
      return Object.assign({}, state, { destns: action.destns });
    case 'setSourcens':
      return Object.assign({}, state, { sourcens: action.sourcens });
    case 'setProgress':
      return Object.assign({}, state, { progress: true });
    case 'unsetProgress':
      return Object.assign({}, state, { progress: false });
    case 'setError':
      return Object.assign({}, state, { error: action.message });
    case 'setPayload':
      return Object.assign({}, state, { payload: action.payload });
    default:
      return defaultState;
  }
};
