import Logo from "./Logo";

const Legend = ({meetingID, eventName, participants}) => {
    return (
        <div className="w-full h-[25%]">
            <div className="w-full h-full py-8 px-8 bg-white rounded-bl-[20px] rounded-br-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
                <div className='flex gap-8 justify-between'>
                    <div className="flex flex-col gap-2">
                        <Logo size={"32pt"}/>
                        <span>Meeting ID: {meetingID}</span>
                        <span>Event: {eventName}</span>
                    </div>
                    <div className="flex flex-col gap-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        {participants.map(participant => (
                            <div className="flex gap-2 items-center">
                                <p className="truncate max-w-[150px]">{participant.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Legend;