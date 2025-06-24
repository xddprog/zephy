import { MenuFoldOutlined, MenuUnfoldOutlined, DesktopOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import { useState } from "react";

function StreamsMenu() {
    const [collapsed, setCollapsed] = useState(false);
    const menuItems = [
        { key: 1, label: 'Stream 1', icon: <DesktopOutlined /> },
        { key: 2, label: 'Stream 2', icon: <DesktopOutlined /> },
        { key: 3, label: 'Stream 3', icon: <DesktopOutlined /> },
        { key: 4, label: 'Stream 4', icon: <DesktopOutlined /> },
        { key: 5, label: 'Stream 5', icon: <DesktopOutlined /> },
        { key: 6, label: 'Stream 6', icon: <DesktopOutlined /> },
        { key: 7, label: 'Stream 7', icon: <DesktopOutlined /> },
    ]

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={`flex flex-col ${collapsed ? 'w-20' : 'w-64'} bg-[#17191b] text-white h-screenf flex-shrink-0`}>
            <div className={`flex ${collapsed ? 'justify-center' : 'justify-between pl-6'} items-center pt-2`}>
                {!collapsed && <p className="text-white font-light text-m">
                    Активные стримы
                </p>}
                <Button
                    type="text"
                        onClick={toggleCollapsed} 
                    >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </Button>
            </div>
            <Menu
                mode="inline"
                theme="dark"
                inlineCollapsed={collapsed}
                className="bg-[#17191b] text-white"
            >
                {menuItems.map(item => (
                    <Menu.Item key={item.key} icon={item.icon}>
                        {item.label}
                    </Menu.Item>
                ))}
            </Menu>
        </div>
    );
}

export default StreamsMenu;