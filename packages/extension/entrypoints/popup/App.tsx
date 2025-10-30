import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

type Status = "disconnected" | "connecting" | "connected";

export default function Popup() {
  const [wsStatus, setWsStatus] = useState<Status>("disconnected");
  const [noteStatus, setNoteStatus] = useState<Status>("disconnected");

  useEffect(() => {
    checkWsStatus();
  }, []);

  const checkWsStatus = () => {
    chrome.runtime.sendMessage({ type: "GET_WS_STATUS" }, (resp) => {
      setWsStatus(resp.status);
    });
  };

  return (
    <div className="flex flex-col p-4 w-[320px]  bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 font-lexend">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
          <img
            src="/images/mcp.png"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="text-2xl font-bold mr-1 text-gray-600">+</div>
          <img
            src="/images/loilonote.png"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>
        <h1 className="text-2xl font-bold">Loilonote MCP</h1>
      </div>

      {/* Status */}
      <div className="w-full flex-1 flex flex-col justify-center gap-4 mt-4">
        <Status status={wsStatus} title="Server" onRefresh={checkWsStatus} />
        <Status status={noteStatus} title="Note" onRefresh={() => {}} />
      </div>
    </div>
  );
}

const Status = ({
  status,
  title,
  onRefresh,
}: {
  status: Status;
  title: string;
  onRefresh: () => void;
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
          <Indicator status={status} />
        </div>
        <button
          className="flex items-center bg-gray-200 hover:bg-gray-300 gap-2 px-4 py-2 rounded-full transition-all duration-300"
          onClick={onRefresh}
        >
          <RefreshCcw size={16} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>
    </div>
  );
};

const Indicator = ({ status }: { status: Status }) => {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case "connected":
        return {
          color: "bg-green-500",
          text: "Connected",
          ringColor: "ring-green-200",
        };
      case "connecting":
        return {
          color: "bg-yellow-500",
          text: "Connecting",
          ringColor: "ring-yellow-200",
        };
      case "disconnected":
        return {
          color: "bg-red-500",
          text: "Disconnected",
          ringColor: "ring-red-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${config.color} ${config.ringColor} ring-4 animate-pulse`}
        ></div>
        {status === "connecting" && (
          <div
            className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping`}
          ></div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-700">{config.text}</p>
    </div>
  );
};
