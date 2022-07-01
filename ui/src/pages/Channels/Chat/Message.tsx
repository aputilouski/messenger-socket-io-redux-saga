import { Paper, Slide, styled } from '@mui/material';
import clsx from 'clsx';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';

const Message = ({
  my = false,
  read = false,
  appear = false, //
  container,
  children,
}: {
  my?: boolean;
  read?: boolean;
  appear?: boolean;
  container: Element | null;
  children?: string;
}) => {
  return (
    <Slide //
      direction="up"
      in={true}
      appear={appear}
      container={container}>
      <Paper className={clsx('py-2.5 px-3.5 max-w-lg', my ? 'self-start' : 'self-end')} elevation={4}>
        <p className="whitespace-pre-line text-gray-800">{children}</p>
        <p className="text-xs text-gray-600 relative top-1 -right-1.5 flex justify-end align-center gap-1.5">
          <span>12:12</span>
          {!my && (read ? <StyledDoneAllRoundedIcon /> : <StyledDoneRoundedIcon />)}
        </p>
      </Paper>
    </Slide>
  );
};

export default Message;

const StyledDoneRoundedIcon = styled(DoneRoundedIcon)(({ theme }) => ({
  fontSize: '1rem',
}));
const StyledDoneAllRoundedIcon = styled(DoneAllRoundedIcon)(({ theme }) => ({
  fontSize: '1rem',
}));
