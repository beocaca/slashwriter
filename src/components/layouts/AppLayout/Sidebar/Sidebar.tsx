import { useRouter } from "next/router"
import { useEffect } from "react"
import Flex from "src/components/Flex"
import Separator from "src/components/Separator"
import Loader from "src/components/ui/Loader"
import Typography from "src/components/ui/Typography"
import { useGetDocumentsQuery } from "src/services/documents"
import { useGetFoldersQuery } from "src/services/folders"
import { useAppDispatch, useAppSelector } from "src/store"
import { hideMobileSidebar } from "src/store/ui"
import { useUser } from "src/utils/supabase"
import styled, { css } from "styled-components"

import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import HelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined"
import HomeOutlined from "@mui/icons-material/HomeOutlined"
import StarBorderOutlined from "@mui/icons-material/StarBorderOutlined"
import TuneOutlined from "@mui/icons-material/TuneOutlined"

import AccountSection from "./components/AccountSection"
import AddFolderButton from "./components/AddFolderButton"
import Outliner from "./components/Outliner"
import SidebarItem from "./components/SidebarItem"

export default function Sidebar() {
    const router = useRouter()
    const { user } = useUser()
    const { sidebarOpen, mobileSidebarOpen } = useAppSelector(
        (store) => store.ui
    )
    const dispatch = useAppDispatch()

    const {
        data: folders,
        error: foldersError,
        isLoading: isLoadingFolders
    } = useGetFoldersQuery(null, { skip: !user })

    const {
        data: documents,
        error: documentsError,
        isLoading: isLoadingDocuments
    } = useGetDocumentsQuery(null, { skip: !user })

    useEffect(() => {
        dispatch(hideMobileSidebar())
    }, [router.asPath])

    return (
        <>
            <Backdrop
                onClick={() => dispatch(hideMobileSidebar())}
                visible={mobileSidebarOpen}
            />
            <SidebarComponent
                column
                open={sidebarOpen}
                mobileOpen={mobileSidebarOpen}
            >
                <AccountSection user={user} />
                <Section gap={5}>
                    <SidebarItem.Link
                        icon={<HomeOutlined />}
                        title="Accueil"
                        href="/home"
                    />
                    <SidebarItem.Link
                        icon={<StarBorderOutlined />}
                        title="Favoris"
                        href="/favorites"
                    />
                    <SidebarItem.Link
                        icon={<TuneOutlined />}
                        title="Paramètres"
                        href="/settings"
                    />
                </Section>
                <Separator />
                <Section gap={5} auto>
                    {(isLoadingFolders || isLoadingDocuments) && <Loader />}
                    {(foldersError || documentsError) && (
                        <Typography.Text type="danger">
                            Une erreur est survenue. Voir la console.
                        </Typography.Text>
                    )}
                    {folders && documents && (
                        <Outliner folders={folders} documents={documents} />
                    )}
                    <AddFolderButton />
                </Section>
                <Separator />
                <Section gap={5}>
                    <SidebarItem.Link
                        icon={<DeleteOutlined />}
                        title="Corbeille"
                        href="/trash"
                    />
                    <SidebarItem.Link
                        icon={<HelpOutlineOutlined />}
                        title="Aide"
                        href="/help"
                    />
                </Section>
            </SidebarComponent>
        </>
    )
}

const Backdrop = styled.div<{ visible: boolean }>`
    display: none;

    @media (max-width: 768px) {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 25;
        background: var(--color-black);
        pointer-events: none;
        opacity: 0;
        ${({ visible }) =>
            visible &&
            css`
                opacity: 0.75;
                pointer-events: all;
            `}
        transition: all ease-out 0.2s;
    }
`

const SidebarComponent = styled(Flex)<{ open: boolean; mobileOpen: boolean }>`
    position: relative;
    max-height: 100vh;
    min-width: 300px;
    border-right: 1px solid var(--color-n300);

    background-color: var(--color-white);
    margin-left: ${({ open }) => `${open ? 0 : -300}px`};
    transition: all ease-out 0.25s;
    z-index: 25;

    @media (max-width: 768px) {
        position: absolute;
        top: 0;
        bottom: 0;
        margin-left: 0;
        opacity: ${({ mobileOpen }) => (mobileOpen ? 1 : 0)};
        transform: ${({ mobileOpen }) =>
            mobileOpen ? "translateX(0)" : "translateX(-100%)"};
    }
`

const Section = styled(Flex)`
    margin: 16px 20px;
    flex-direction: column;
`
