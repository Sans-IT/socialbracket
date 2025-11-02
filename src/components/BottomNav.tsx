import { auth } from '@/lib/auth';
import { CirclePlusIcon, HomeIcon,SearchIcon, SettingsIcon, UserRoundIcon } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

async function BottomNav() {
    const session = await auth();
    
    const icons = [
        { id: 1, label: 'Home', icon: <HomeIcon />, link: '/' },
        { id: 2, label: 'Search', icon: <SearchIcon />, link: '#search-input' },
        { id: 3, label: 'AddPost', icon: <CirclePlusIcon />, link: '/buatpostingan' },
        { id: 4, label: 'Profile', icon: <UserRoundIcon />, link: `/profile/${session?.user.username}` },
        { id: 5, label: 'Settings', icon: <SettingsIcon />, link: '/settings' },
    ];

  return (
    <nav className='sm:hidden block w-full bg-background border-t-muted border-t-2 fixed bottom-0'>
        <div className='flex items-center h-full w-full'>
            {icons.map((item) => (
                <Link key={item.id} className='flex flex-col bg-background py-2.5 items-center w-full h-full justify-center text-foreground' href={item.link}>
                    <span className='text-xl'>{item.icon}</span>
                </Link>
            ))}
        </div>
    </nav>
  )
}

export default BottomNav