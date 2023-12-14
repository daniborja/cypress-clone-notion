export type TemplateProps = { children: React.ReactNode };

// // Templates create a new instance for each of their children on navigation
// state is not preserved
const Template: React.FC<TemplateProps> = ({ children }) => {
  return <div className="h-screen p-6 flex justify-center">{children}</div>;
};

export default Template;
