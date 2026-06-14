import React from 'react'
import { AcademicCapIcon } from '@heroicons/react/24/solid'
import AlumniLogo from '../../assets/AluminiLogo.png'

const Footer = () => {
  return (
    <div className='relative bg-background'>
       {/* Footer */}
      <footer className="py-12 lg:pl-50 lg:pr-17 border-t border-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img className="h-6 w-6 text-primary" src={AlumniLogo}/>
                <span className="font-semibold">AlumniConnect</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Connecting students, alumni, and faculty across generations.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Features</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Alumni Directory</p>
                <p>Messaging</p>
                <p>Notifications</p>
                <p>Profile Management</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Community</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Students</p>
                <p>Alumni</p>
                <p>Faculty</p>
                <p>Administrators</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Help Center</p>
                <p>Contact Us</p>
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
              </div>
            </div>
          </div>
          
          <div className=" mt-8 pt-8 text-center text-sm text-muted-foreground lg:pr-17">
            <p>&copy; 2024 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
