import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
// import HealthBody from '@console/shared/src/components/dashboard/status-card/HealthBody';
// import { Status } from '@console/shared';
import { SnsDashboardContext } from './sns-dashboard-context';
// import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
// import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import { SubnamespaceModel } from '../../models';
import { referenceForModel } from '@console/internal/module/k8s';
import { Link } from 'react-router-dom';
import { ResourceIcon } from '@console/internal/components/utils';
// import * as models from '../../models';
// import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
// import { FirehoseResource } from '@console/internal/components/utils/index';
// import { K8sResourceKind, referenceForModel } from '@console/internal/module/k8s';

export const StatusCard: React.FC = () => {
  const { obj } = React.useContext(SnsDashboardContext);
  // console.log(obj)
  // const snsResource: FirehoseResource = {
  //   kind: referenceForModel(models.SubnamespaceModel),
  //   namespaced: false,
  //   isList: false,
  //   prop: 'subnamespace',
  //   name: 'zuriel'
  // };
  // const [snsdata, loaded] = useK8sWatchResource<K8sResourceKind>(snsResource);
  // if (loaded){
  //   // console.log(snsdata)
  //   var x = snsdata?.metadata?.name
  //   // console.log(x)
  // }
  // console.log(obj.status?.total)
  if (!obj.status?.namespaces) {
    return (
      <DashboardCard gradient data-test-id="status-card">
        <DashboardCardHeader>
          <DashboardCardTitle>Subnamespace Childrens</DashboardCardTitle>
        </DashboardCardHeader>
        {/* <DashboardCardBody > */}
        <div className="co-m-pane__body">Not available</div>
        {/* </DashboardCardBody> */}
      </DashboardCard>
    );
  }
  return (
    <DashboardCard gradient data-test-id="status-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Subnamespace Childrens</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <div className="co-m-pane__body">
          <SnsChildernsTable father={obj.metadata.name} snsChildrens={obj.status?.namespaces} />
        </div>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export const SnsChildernsTable: React.FC<SnsChildernsTableProps> = ({ father, snsChildrens }) => (
  <>
    <div className="co-m-table-grid co-m-table-grid--bordered">
      <div className="row co-m-table-grid__head">
        <div className="col-lg-3 col-md-3 col-sm-5 col-xs-7">Name</div>
        <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">CPU</div>
        <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">Memory</div>
        <div className="col-lg-2 hidden-md hidden-sm hidden-xs">GPU</div>
        <div className="col-lg-2 hidden-md hidden-sm hidden-xs">Storage</div>
        <div className="col-lg-1 hidden-md hidden-sm hidden-xs">Pods</div>
      </div>
      <div className="co-m-table-grid__body">
        {snsChildrens.map((ns: any, i: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <NamespaceRow key={i} namespace={ns} father={father} />
        ))}
      </div>
    </div>
  </>
);

export const NamespaceRow: React.FC<NamespaceRowProps> = ({ father, namespace }) => {
  return (
    <div className="row">
      <div className="col-lg-3 col-md-3 col-sm-5 col-xs-7">
        <SnsLink sns={namespace} father={father} />
      </div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.cpu || '-'}
      </div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.memory || '-'}
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.['requests.nvidia.com/gpu'] || '-'}
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.['basic.storageclass.storage.k8s.io/requests.storage'] ||
          '-'}
      </div>
      <div className="col-lg-1 hidden-md hidden-sm hidden-xs co-truncate co-nowrap co-select-to-copy">
        {namespace.resourcequota.hard?.pods || '-'}
      </div>
    </div>
  );
};

export const SnsLink: React.FC<SnsLinkProps> = ({ father, sns }) => (
  <span className="co-resource-item co-resource-item--inline">
    <ResourceIcon kind="Subnamespace" />
    <Link to={`/k8s/ns/${father}/${referenceForModel(SubnamespaceModel)}/${sns.namespace}`}>
      {sns.namespace}
    </Link>
  </span>
);
SnsLink.displayName = 'SnsLink';

type SnsLinkProps = {
  father: string;
  sns: any;
};

type NamespaceRowProps = {
  father: string;
  namespace: any;
};

type SnsChildernsTableProps = {
  father: string;
  snsChildrens: nsSpec[];
};

export type nsSpec = {
  name: string;
  resourcequota?: {
    hard?: ResourceList;
  };
};

export type ResourceList = {
  [resourceName: string]: string;
};
