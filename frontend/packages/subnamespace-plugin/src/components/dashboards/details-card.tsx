import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import { SnsDashboardContext } from './sns-dashboard-context';

export const DetailsCard: React.FC = () => {
  const { obj } = React.useContext(SnsDashboardContext);
  if (!obj.status?.total.free) {
    return (
      <DashboardCard data-test-id="details-card">
        <DashboardCardHeader>
          <DashboardCardTitle>Free Resources</DashboardCardTitle>
        </DashboardCardHeader>
        <div className="co-m-pane__body">This is Resource Pool</div>
      </DashboardCard>
    );
  }
  return (
    <DashboardCard data-test-id="details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Free Resources</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <div className="co-m-pane__body">
          <SnsChildernsTable snsFree={obj.status?.total.free} />
        </div>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export const SnsChildernsTable: React.FC<SnsChildernsTableProps> = ({ snsFree }) => (
  <>
    <div className="co-m-table-grid co-m-table-grid--bordered">
      <div className="row co-m-table-grid__head">
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">CPU</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">Memory</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">GPU</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">Storage</div>
        <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">Pods</div>
      </div>
      <div className="co-m-table-grid__body">
        <div className="row">
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree.cpu || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree.memory || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree['requests.nvidia.com/gpu'] || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree['basic.storageclass.storage.k8s.io/requests.storage'] || '-'}
          </div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">
            {snsFree.pods || '-'}
          </div>
        </div>
      </div>
    </div>
  </>
);

type SnsChildernsTableProps = {
  snsFree: any;
};
