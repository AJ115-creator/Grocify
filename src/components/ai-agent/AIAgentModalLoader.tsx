import AIAgentModal from "./AIAgentModal";

type AIAgentModalLoaderProps = {
    visible: boolean;
    onClose: () => void;
};

const AIAgentModalLoader = ({ visible, onClose }: AIAgentModalLoaderProps) => {
    return <AIAgentModal visible={visible} onClose={onClose} />;
};

export default AIAgentModalLoader;
