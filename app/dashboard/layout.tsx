import { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="md:px-25 md:py-25 px-5 py-20">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-6xl font-bold gradient gradient-title ">Industry Insights</h1>
            </div>
                {children}
        </div>
    );
};

export default Layout;