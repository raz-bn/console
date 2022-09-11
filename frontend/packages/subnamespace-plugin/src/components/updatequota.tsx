import * as React from 'react';
import * as _ from 'lodash';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import {
  ListPage,
  Table,
  TableRow,
  TableData,
  RowFunction,
} from '@console/internal/components/factory';
import { Status } from '@console/shared';
import {
  Kebab,
  ResourceKebab,
  ResourceLink,
  Timestamp,
  resourcePathFromModel,
} from '@console/internal/components/utils';
import { K8sResourceKind, referenceForModel } from '@console/internal/module/k8s';
import { UpdatequotaModel } from '../models';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(UpdatequotaModel), ...common];

const tableColumnClasses = [
  classNames('col-lg-4', 'col-md-4', 'col-sm-5', 'col-xs-6'),
  classNames('col-lg-4', 'col-md-4', 'col-sm-5', 'col-xs-6'),
  classNames('col-lg-2', 'col-md-2', 'col-sm-3', 'col-xs-4'),
  classNames('col-lg-6', 'col-md-6', 'col-sm-7', 'col-xs-8'),
  classNames('col-lg-4', 'col-md-4', 'col-sm-2', 'hidden-xs'),
  Kebab.columnClass,
];

const UpdatequotaTableHeader = () => {
  return [
    {
      title: 'From Namespace',
      sortField: 'spec.sourcens',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'To Namespace',
      sortField: 'spec.destns',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Status',
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Message',
      sortField: 'status.reason',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: 'Created',
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[5] },
    },
  ];
};
UpdatequotaTableHeader.displayName = 'UpdatequotaTableHeader';

const UpdatequotaTableRow: RowFunction<K8sResourceKind> = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.spec.sourcens} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.spec.destns} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>
        <Status status={obj.status?.phase} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[3], 'co-break-word')}>
        <Status status={obj.status?.reason} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[4], 'co-break-word')}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab
          actions={menuActions}
          kind={referenceForModel(UpdatequotaModel)}
          resource={obj}
        />
      </TableData>
    </TableRow>
  );
};

export const UpdatequotaList: React.SFC = React.memo((props) => {
  return (
    <Table
      {...props}
      aria-label={UpdatequotaModel.labelPlural}
      Header={UpdatequotaTableHeader}
      Row={UpdatequotaTableRow}
      // customData={snsFather}
      virtualize
    />
  );
});
UpdatequotaList.displayName = 'UpdatequotaList';

export const UpdatequotaPage: React.FC<UpdatequotaPageProps> = (props) => {
  const createProps = {
    to: `${resourcePathFromModel(
      UpdatequotaModel,
      null,
      _.get(props, 'namespace', 'default'),
    )}/~new/form`,
    // to: `/k8s/ns/${props.namespace}/${referenceForModel(UpdatequotaModel)}/~new/form`
  };

  return (
    <ListPage
      {..._.omit(props, 'mock')}
      title="Update Quota"
      kind={referenceForModel(UpdatequotaModel)}
      ListComponent={UpdatequotaList}
      canCreate
      createProps={createProps}
      createButtonText="Create Update Quota"
    />
  );
};

export type UpdatequotaPageProps = {
  namespace?: string;
  name: string;
};
