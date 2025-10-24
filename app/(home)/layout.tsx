export default function Layout({ children }: LayoutProps<"/">) {
    return <div>{children}</div>;
}
export const metadata = {
    openGraph: {
        title: "HA Components",
        description: "Build your own beautiful Home Assistant dashboard.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "HA Components",
            },
        ],
    },
};
