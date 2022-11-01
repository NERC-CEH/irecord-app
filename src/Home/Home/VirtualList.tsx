import { FC, useEffect, useState, useRef, forwardRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import { useIonViewDidEnter } from '@ionic/react';

// eslint-disable-next-line react/no-unstable-nested-components
const VirtualList: FC<any> = ({
  itemSize,
  Item,
  topPadding = 0,
  bottomPadding = 0,
  ...props
}) => {
  const contentRef = useRef<any>();
  const listRef = useRef<any>();
  const [listHeight, setListHeight] = useState<number>(1); // some positive number

  const setCurrentContentHeight = () => {
    if (contentRef?.current?.clientHeight) {
      setListHeight(contentRef.current.clientHeight);
    }
  };
  useIonViewDidEnter(setCurrentContentHeight); // before mounting the first time list has no height
  useEffect(setCurrentContentHeight, [contentRef.current]);
  const refreshMapOnResize = () => {
    window.addEventListener('ionKeyboardDidHide', setCurrentContentHeight);
    return () => {
      window.removeEventListener('ionKeyboardDidHide', setCurrentContentHeight);
    };
  };
  useEffect(refreshMapOnResize);

  // eslint-disable-next-line react/no-unstable-nested-components
  const ItemWithPadding = ({ style, ...itemProps }: any) => (
    <Item
      style={{ ...style, top: style.top + topPadding, height: 'auto' }}
      {...itemProps}
    />
  );

  // Add bottom padding
  // eslint-disable-next-line react/no-unstable-nested-components
  const innerElementType = forwardRef(({ style, ...rest }: any, ref) => (
    <div
      ref={ref}
      style={{
        ...style,
        height: `${parseFloat(style.height) + topPadding + bottomPadding}px`,
      }}
      {...rest}
    />
  ));

  const resetIfItemsChange = () => {
    if (listRef?.current) {
      listRef.current.resetAfterIndex(0);
    }
  };
  useEffect(resetIfItemsChange, [itemSize]);

  return (
    <div style={{ height: '100%' }} ref={contentRef}>
      <List
        ref={listRef}
        height={listHeight}
        itemSize={itemSize}
        innerElementType={bottomPadding ? innerElementType : undefined}
        width="100%"
        {...props}
      >
        {ItemWithPadding}
      </List>
    </div>
  );
};

export default VirtualList;
