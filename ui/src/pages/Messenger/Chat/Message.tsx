import React from 'react';
import { Paper, Slide, styled } from '@mui/material';
import clsx from 'clsx';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';

type MessageProps = {
  my?: boolean;
  read?: boolean;
  time: string;
  container: Element | null;
  children?: string;
};

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  (
    { my = false, read = false, time, container, children },
    ref //
  ) => (
    <Slide //
      direction={my ? 'left' : 'right'}
      in={true}
      // appear={appear}
      container={container}>
      <Paper //
        ref={ref}
        sx={{ backgroundColor: my ? 'primary.main' : 'secondary.main' }}
        className={clsx('py-2.5 px-3.5 max-w-lg', my ? 'self-end' : 'self-start')}
        elevation={4}>
        <p className="whitespace-pre-line text-white">{children}</p>
        <p className="text-xs text-white relative top-1 -right-1.5 flex justify-end align-center gap-1.5">
          <span>{time}</span>
          {!my && (read ? <StyledDoneAllRoundedIcon /> : <StyledDoneRoundedIcon />)}
        </p>
      </Paper>
    </Slide>
  )
);

export default Message;

const StyledDoneRoundedIcon = styled(DoneRoundedIcon)({ fontSize: '1rem' });
const StyledDoneAllRoundedIcon = styled(DoneAllRoundedIcon)({ fontSize: '1rem' });
