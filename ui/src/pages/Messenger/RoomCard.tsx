import { Avatar, Paper, Badge, ButtonBase, styled } from '@mui/material';
import { timestampFormat } from 'utils';

type RoomCardProps = {
  name: string;
  connected: boolean;
  lastMessage?: Message;
  unreadCount: number;
  onClick: () => void;
};

const RoomCard = ({ name, connected, unreadCount, lastMessage, onClick }: RoomCardProps) => (
  <ButtonBase component={Paper} elevation={4} sx={{ borderRadius: 1 }} onClick={onClick}>
    <div className="flex gap-4 w-full py-2.5 px-3.5">
      <div className="self-center">
        <StyledBadge //
          invisible={!connected}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot">
          <Avatar>{name[0]}</Avatar>
        </StyledBadge>
      </div>
      <div className="grow">
        <div className="flex justify-between mb-1">
          <p>{name}</p>
          <p className="text-xs text-gray-600">{lastMessage && timestampFormat(lastMessage.created_at)}</p>
        </div>
        <div className="flex justify-between text-xs gap-4">
          <p className="grow text-gray-600 w-0 truncate">{lastMessage?.text}</p>
          {Boolean(unreadCount) && <p className="font-bold text-white bg-secondary rounded-full p-1 leading-none w-5 text-center">{unreadCount}</p>}
        </div>
      </div>
    </div>
  </ButtonBase>
);

export default RoomCard;

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    'backgroundColor': '#44b700',
    'color': '#44b700',
    'boxShadow': `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));
